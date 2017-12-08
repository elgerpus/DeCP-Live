package eCP

import eCP.Java.DeCPDyTree
import extLibrary.boofcvlib

object TestDyTreeIndexConstruction {
  def main(args: Array[String]): Unit = {
    if (args.length < 8) {
      println("Input parameters for usage are:")
      println("< C (number of clusters)>, " +
        "< L (depth)>, " +
        "< treeA (soft-assignment in index)> " +
        "< OutputFileName (/path/name.ser)>, " +
        "< ImagesToExtractFrom (/path/images/)>, " +
        "< ")
      sys.exit(2)
    }
    val booflib = new boofcvlib   // load the SIFT extractor library..
    var myTree = new DeCPDyTree   // create a new index structure
    var C = args(0).toInt
    myTree.L =      args(1).toInt
    myTree.treeA =  args(2).toInt

    val images = booflib.recursiveListJPGFiles( new java.io.File( args(4) ) )
    

  }
}
