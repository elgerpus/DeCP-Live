package extLibrary

import java.awt.Graphics
import java.awt.image.BufferedImage
import java.io.{File, FilenameFilter}
import java.nio.file.{Paths, Files}

import boofcv.io.image.UtilImageIO
import boofcv.struct.image.ImageFloat32
import eCP.Java.{SiftDescriptorContainer, boofcvWrapper}
import org.apache.spark.rdd.RDD
import org.apache.spark.{SparkContext, SparkConf}


/**
 * Created by gylfi on 4/22/15.
 * This is code needed to use the BoofCV library to do SIFT descriptor extraction from images.
 * http://boofcv.org
 */
class boofcvlib() extends Serializable {

  /**
   * Rescale the images
   * @param img BufferedImage to rescale
   * @param maxEdge Resized max-size of the wider edge, either width or height
   * @return The rescaled BufferedImage
   */
  def rescaleBufferedImage ( img : BufferedImage, maxEdge: Double ) : BufferedImage = {
    // rescale code
    val w: Int = img.getWidth
    val h: Int = img.getHeight
    var r: Double = 1.0
    // find the larger edge and resize it to maxEdge value
    if (w > maxEdge & w > h ) {
      r = maxEdge / w
    } else if ( h > maxEdge ) {
      r = maxEdge / h
    } else {
      return img
    }
    val wr: Int = (w * r).asInstanceOf[Int]
    val hr: Int = (h * r).asInstanceOf[Int]
    val imgScaled: BufferedImage = new BufferedImage(wr, hr, BufferedImage.TYPE_INT_RGB)
    val g: Graphics = imgScaled.createGraphics
    g.drawImage(img, 0, 0, wr, hr, null)
    g.dispose

    imgScaled
  }

  /**
   * Extract SIFT descriptors from images, in an RDD[File], and return, for each image, an array of descriptors
   * The whole RDD of images is thus returned as an RDD of arrays where each array contains SiftDescriptorContainers or
   * we return an RDD[ Array[ SiftDescriptorContainer ] ]
   * @param sc The Spark Context
   * @param imageFilesRDD RDD of image files
   * @return An RDD of arrays where each array contains all the Sifts extraced from each image.
   */
  def getSiftDescriptorsFromImagesAsRDDofArraysOfSiftDescriptorContainers(
      sc : SparkContext, imageFilesRDD : RDD[File] ): RDD[Array[SiftDescriptorContainer]] =
  {
    // for each image file in imageFilesRDD we :
    val res = imageFilesRDD.flatMap( imgFile => {
      // create a new boofcvWrapper
      val extractor = new boofcvWrapper()
      // create a buffered image instance
      val bfimg: BufferedImage =
      try {
        UtilImageIO.loadImage(imgFile.getAbsolutePath)
      } catch {
        case e: Exception => {
          println("Failed to load image file " + imgFile.getAbsolutePath )
          println(e.getMessage)
          null
        }
      }
      val descriptors : Array[SiftDescriptorContainer] =
        // check if we failed to load the image file
        if (bfimg == null) {
          new Array[SiftDescriptorContainer](0)
        } else {
          // we first resize the image and the size is hardcoded here to 756.0 on the wider edge
          //TODO: make image size a variable and not hardcoded to 756px
          //val imageMaxEdgeSize = 512.0
          val imageMaxEdgeSize = 756.0
          //val imageMaxEdgeSize = 1024.0
          val imgScaled = rescaleBufferedImage( bfimg, imageMaxEdgeSize )

          val imgf32 : ImageFloat32 = new  ImageFloat32( imgScaled.getWidth(), imgScaled.getHeight())
          boofcv.core.image.ConvertBufferedImage.convertFrom(imgScaled, imgf32)
          val imageID : Int =
          try {
            // if the image is named only by number it is one of our test images
            imgFile.getName.substring(0,imgFile.getName.length-4).toInt
          } catch {
            // if it is not named by number it is a adhoc image and we give it a random name
            case e: Exception => new scala.util.Random(System.currentTimeMillis()).nextInt()
          }
          // extract the sifts from the image
          getSiftDescriptorContainerArrayFromImageByteArrays( imageID, extractor.getSIFTDescriptorsAsByteArrays(imgf32) )
      }
      List(descriptors)
    })
    res
  }

  def getDescriptorUniqueIDAndSiftDescriptorsAsRDDfromRDDofImageFiles(
    sc : SparkContext, imageFilesRDD : RDD[File] ): RDD[(String, SiftDescriptorContainer)] = {
    val res = getSiftDescriptorsFromImagesAsRDDofArraysOfSiftDescriptorContainers(sc, imageFilesRDD)
      .flatMap( it => {
        var ret : List[(String, SiftDescriptorContainer)] = Nil
        for ( i <- 0 until it.length ) {
          // we need key each QP uniquely, so we combine the ImageID and array order into a String separated by '_'.
          val id = it(i).id.toString + "_" + i
          val pair = (id, it(i) )
          ret = List( pair ) ::: ret
        }
      ret
    })
    res
  }

  /**
   * Convert all descriptor byte arrays into the SiftDescriptorContainer class format we use in our system
   * @param id Image ID
   * @param descriptors The image Sift descriptors as an array of byte-arrays
   * @return Return an array of SiftDescriptorContainers
   */
  def getSiftDescriptorContainerArrayFromImageByteArrays ( id : Int, descriptors : Array[Array[Byte]])
  : Array[SiftDescriptorContainer] ={
    descriptors.map( vec => new SiftDescriptorContainer(id,vec) )
  }

  /**
   * This function extracts descriptors from images and records the time it takes. It supports both distributed
   * and localized (on master) extraction, controlled by the useRDD boolean variable.
   * @param sc  Spark context
   * @param imageFiles Array of image files to extract Sifts from
   * @param useRDD  Controls whether to do local or distributed extraction using Spark
   * @param imageMaxEdgeSize  variable to set the maximum edge size (both height and width)
   * @return returns a array of tuples were each tuple is a String and array of descriptors (that are byte-arrays)
   */
  def getTimeAndSiftsAsByteArrayFromImageFiles (sc : SparkContext,
                                                imageFiles : Array[File],
                                                useRDD : Boolean,
                                                imageMaxEdgeSize: Double )
  : Array[((String, Long), Array[Array[Byte]])] = {

    val imagedescriptors = if (useRDD) {
      // distribute the extraction and run it on Spark
      val imageFilesRDD = sc.parallelize(imageFiles)
        val descriptors = imageFilesRDD.flatMap( imgFile => {
          val start = System.currentTimeMillis()
          val extractor = new boofcvWrapper()
          val orgImg = UtilImageIO.loadImage( imgFile.getAbsolutePath )
          val scaledImg = this.rescaleBufferedImage( orgImg, imageMaxEdgeSize )
          val imgf32 : ImageFloat32 = new  ImageFloat32( scaledImg.getWidth(), scaledImg.getHeight() )
          boofcv.core.image.ConvertBufferedImage.convertFrom( scaledImg, imgf32 )
          val descriptors = extractor.getSIFTDescriptorsAsByteArrays( imgf32 )
          val end = System.currentTimeMillis()
          println("Extracted " + descriptors.length + " in " + (end-start) + " ms."+
          "from " +  imgFile.getAbsolutePath)
          val info : (String, Long) = Pair (imgFile.getName.substring(0, imgFile.getName().length-4), (end-start))
          List( ( info, descriptors ) )
      }).collect()
      descriptors
    } else {
      // do a local extraction only (runs on the master)
      val descriptors = imageFiles.flatMap( imgFile => {
        val start = System.currentTimeMillis()
        val extractor = new boofcvWrapper()
        val orgImg = UtilImageIO.loadImage(imgFile.getAbsolutePath)
        val scaledImg = this.rescaleBufferedImage( orgImg, imageMaxEdgeSize )
        val imgf32 : ImageFloat32 = new  ImageFloat32( scaledImg.getWidth(), scaledImg.getHeight() )
        boofcv.core.image.ConvertBufferedImage.convertFrom( scaledImg, imgf32 )
        val descriptors = extractor.getSIFTDescriptorsAsByteArrays(imgf32)
        val end = System.currentTimeMillis()
        println("Extracted " + descriptors.length + " in " + (end-start) + " ms."+
          "from " +  imgFile.getAbsolutePath)
        val info : (String, Long) = Pair (imgFile.getName.substring(0, imgFile.getName().length-4), (end-start))
        List( ( info, descriptors ) )
      })
      descriptors
    }
    imagedescriptors
  }

  /**
   * Returns a list of all .jpg files in filesystem sub-tree (recursive traversal down the rabbit hole)
   * @param f Directory to traverse looking for .jpg files
   * @return all .jpg files in and bellow directory f
   */
  def recursiveListJPGFiles(f: File): Array[File] = {

    val filter = new FilenameFilter {
      override def accept(dir: File, name: String): Boolean = {
        var ret = false
        if ( name.endsWith(".jpg") ) {
          ret = true
        }
        ret
      }
    }
    val images = f.listFiles(filter)
    val folders = f.listFiles()
    images ++ folders.filter(_.isDirectory).flatMap(recursiveListJPGFiles)
  }
}
