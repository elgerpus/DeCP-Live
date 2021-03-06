package pipelines

import java.io.{BufferedInputStream, FileInputStream, ObjectInputStream}
import java.lang.instrument.Instrumentation

import eCP.Java.{SiftDescriptorContainer, DeCPDyTree}
import org.apache.hadoop.io.IntWritable
import org.apache.hadoop.conf._
import org.apache.hadoop.fs._
import org.apache.spark.SparkContext
import org.apache.spark.SparkContext._
import org.apache.spark._
import org.apache.spark.rdd.{PairRDDFunctions, RDD, CoGroupedRDD}


/**
 * Created by gylfi on 10/26/15.
 */
object DeCPAssignments_DataInRDDTuple_IDnByteArray_DynamicTree {
  def main(args: Array[String]): Unit = {
    if (args.length < 6) {
      println("Too few parameters:")
      println("<SparkMaster> <SparkHome> <IndexObjectFile> <RawdataRDDFile(s)[path;path;...]> <OutputPath> <OutputFormat[0,1,2]>"
        + " Optional: <mergeWithExistingDB 1 = yes> + <OldDBPath")
      sys.exit(2)
    }
    // parse program arguments into variable-names that make some sense
    val sparkMaster = args(0)
    val sparkHome = args(1)
    val objectIndexFile = args(2)
    val siftDescriptorsFile_in = args(3) // "100M_bigann_base.seq"
    val outputFileName = args(4)
    // output format 0 = sequenceFile only; 1 = objectFile only; default = Both object- and sequenceFile are created.
    val outputFormat = args(5).toInt
    var doMerge = 0
    var oldDBpath = ""
    if (args.length > 7) {
      doMerge = args(6).toInt
      if (doMerge == 1) {
        oldDBpath = args(7)
        println("Will end with a merger with " + oldDBpath)
      }
    } else {
      println("New Database, no merger with existing")
    }

    // create the spark context
    val conf = new SparkConf()
      .setMaster(sparkMaster)
      .setAppName("DeCPAssignments")
      .setSparkHome(sparkHome)
      .setJars(SparkContext.jarOfObject(this).toSeq)
      //.set("spark.executor.memory", "1G")
      //.set("spark.driver.memory", "4G")
      //.set("spark.broadcast.blocksize", "16384")
      //.set("spark.files.fetchTimeout", "600")
      //.set("spark.worker.timeout","180")
      //.set("spark.driver.maxResultSize", "0") // 0 = unlimited
      //.set("spark.shuffle.manager", "SORT")
      //.set("spark.shuffle.consolidateFiles", "false")  // if true we have fetch failure, Kay says try without.
      //.set("spark.shuffle.spill", "true")
      //.set("spark.shuffle.file.buffer.kb", "1024")
      // because we use disk-only caching we reverse memoryFraction allocation.
      //.set("spark.shuffle.memoryFraction", "0.6")  // default 0.3
      //.set("spark.storage.memoryFraction","0.3")   // default 0.6
      //.set("spark.reducer.maxMbInFlight", "128")     // tried 128 and had issues.
      //.set("spark.akka.threads", "300")   // number of akka actors
      //.set("spark.akka.timeout", "180")   //
      //.set("spark.akka.frameSize", "10")  //
      //.set("spark.akka.batchSize", "30")  //
      //.set("spark.akka.askTimeout", "30") // supposedly this is important for high cpu/io load
      //.set("spark.local.dir", "/Volumes/MrRed/tmp")
    val sc = new SparkContext(conf)
    println(sc.getConf.toDebugString)

    //#### CONCATENATING multiple input files
    // then we load the raw data as an from potentially multiple RDDs, path separated by ';', and concatenate them
    var rawRDD : RDD[(Int, Array[Byte])] = sc.parallelize(Nil)
    for ( str <- siftDescriptorsFile_in.split("--") ) {
      println("loading RDD: " + str)
      rawRDD = rawRDD.union(sc.objectFile(str).asInstanceOf[RDD[(Int, Array[Byte])]])
    }

    //#### LOADING THE INDEX starts, the index is stored in an object file #####################

    println("Loding the index from object file")
    var start = System.currentTimeMillis()
    val buff = new BufferedInputStream( new FileInputStream(objectIndexFile) , Int.MaxValue / 2   )
    val objectInputStream: ObjectInputStream = new ObjectInputStream( buff )
    //val objectInputStream: ObjectInputStream = new ObjectInputStream( new FileInputStream(objectIndexFile) )
    val myTree : DeCPDyTree = objectInputStream.readObject().asInstanceOf[DeCPDyTree]
    objectInputStream.close()
    var end = System.currentTimeMillis()
    println("loading the object took " + (end - start).toString() + "ms")
    println("The index has " + myTree.getNumberOfLeafClusters() + " clusters organized in an " + myTree.L +
      " deep hierarchy that uses a " + myTree.treeA + " folding replication strategy")
    //### DONE LOADING THE INDEX ##########################

    // ### CLUSTERING THE DATA, read raw data from sequence file cluster by traversing the index  ########
    // first we have to broadcast the index to all the participating nodes
    start = System.currentTimeMillis()
    val myTreeBc = sc.broadcast[DeCPDyTree](myTree)
    end = System.currentTimeMillis()
    println("Broadcasting the index took " + (end-start) + "ms." )


    // single assignment is easy as it's a map() of 1-to-1, so we .map over the input RDD, calling the indexing
    val indexedRDD = rawRDD.map( pair => {
      // this map is needed as to create the SiftDescriptorContainer
      val desc = new SiftDescriptorContainer()
      desc.id = pair._1
      desc.vector = pair._2
      (pair._1, desc)
    }).map( pair => {  // the acutal indexing happens here
      val clusterID = myTreeBc.value.getTopStaticTreeCluster(pair._2, 1)(0).id
      //println(tuple._2.id + ": " + clusterID)
      (clusterID, pair._2)
    })
    //indexedRDD.persist(org.apache.spark.storage.StorageLevel.DISK_ONLY)
    // unload the index from the workers and free up the memory before we start shuffeling.
    myTreeBc.unpersist(true)
    System.gc()
    println("Done clustering")
    // ### DONE CLUSTERING THE DATA #######################

    // ### Now we need to group and/or sort the data into clusters and store it to disk ###############

    val dbFileUnsortedSeqName     = outputFileName + "_unsorted_asSequenceFile"
    val dbFileSortSeqName         = outputFileName + "_sorted_asSequenceFile"
    val dbFileObjName             = outputFileName + "_grouped_toArray_asObjectFile"

    if ( outputFormat == 0 ) {
      // alternative 0, only do a sortByKey + write to a sequencefile, arrays are not HDFS writeable by default.
      val indexedRDDsortedByKey = indexedRDD.sortByKey().map( pair => {
        val iwr = new IntWritable(pair._1)
        (iwr, pair._2)
      })
      indexedRDDsortedByKey.saveAsSequenceFile(dbFileSortSeqName)
    }
    else if ( outputFormat == 1 ) {
      // alternative 1, Store grouped data into object files,
      // first do a groupByKey, (optionally do a sort) and also change iterable to array + write to object file.
      println("Storing clustered data as objectFile \n" + "First group by cluster ID and then write to file")
      val indexedRDDgroupedByKey = indexedRDD.groupByKey().map( pair => {
        (pair._1, pair._2.toArray)
      })

      if (oldDBpath != "") {
        try {
          // ## added to try to improve perf.
          //
          //val forceInstantiation =  indexedRDDgroupedByKey.count()
          //println("Forced and persisted indexedRDDgroupByKey:  " + forceInstantiation )
          // ##
          //val newDB = leftOuterJoinTwoDBRDDs(oldDB, indexedRDDgroupedByKey)

          // #2
          println(" opening old DB: " + oldDBpath)
          val oldDB = sc.objectFile(oldDBpath).asInstanceOf[RDD[(Int, Array[SiftDescriptorContainer])]]
          println("it has " + oldDB.partitions.length + "partitions ")

          println("Merging the two DBs and saving it back to disk as an objectFile")
          val newDB = oldDB.union(indexedRDDgroupedByKey).reduceByKey( (a,b) => {
            a ++ b
          })
          newDB.saveAsObjectFile(dbFileObjName)

          // ## added to try to improve perf. (clean-up)
          //indexedRDDgroupedByKey.unpersist()
        }
        catch {
          case e : Exception => {
            println("Exception caught when tyring to merge to DBs \n StackTrace:")
            e.printStackTrace()
          }
        }

      } else {
        indexedRDDgroupedByKey.saveAsObjectFile(dbFileObjName)
      }

    }
    else {
      println("Non-valid output format selected so DB WAS NOT WRITTEN TO DISK!")
    }

    println("fin")
  }


  def leftOuterJoinTwoDBRDDs( dbRDD : RDD[(Int, Array[SiftDescriptorContainer])],
                              addition : RDD[(Int, Array[SiftDescriptorContainer])]
                              ) : RDD[(Int, Array[SiftDescriptorContainer])] = {
    val ret = dbRDD.leftOuterJoin(addition)
      .map( a => {
        val id = a._1
        val arr =
          if ( a._2._2 == None) {
            a._2._1
          } else {
            a._2._1 ++ a._2._2.get
          }
        (id, arr)
      })
    return ret
  }
}
