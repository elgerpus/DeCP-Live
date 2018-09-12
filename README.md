# DeCP-Live

A web-interface for DeCP, a high-throughput CBIR system.

[DeCP is also available open source](https://github.com/elgerpus/DeCP)

## Features

* Query
    * Select multiple images for a batch
    * Specify a value for b, k and the number of results per image
    * Alternatively, place a query file directly into the input directory
* View results
    * See what batches have been run
    * See the results of individual batches and image queries
* Maintenance
    * Save the database to disk
    * Halt the DeCP server

## Getting Started

In order to run DeCP and DeCP-Live on your own machine, you will need to either install it on your own machine (follow the setup guide specified in the [INSTALL.md](INSTALL.md) file) or download the pre-installed and ready-to-go [virtual machine](https://drive.google.com/file/d/1Lqx7kxWMlpRCY1b9slrH0mt_pVT9-p4f/view?usp=sharing).

## VM info: 

The virtual machine is installed into Oracle's [VirtualBox](https://www.virtualbox.org/).
 * Google drive [link to VM](https://drive.google.com/file/d/1Lqx7kxWMlpRCY1b9slrH0mt_pVT9-p4f/view?usp=sharing) (it is a ~7GB .zip file).
 * Login info for VM is; username: decp and password: decplive
 * The VM is configured to nat ports to the host and thus you can access the DeCP-Live web-interface by opening your favorite browser and navigate to http://localhost:9080 once the VM is up and running. 
 * To use the search engine you will however need to log in and start it manually (see ~/README file in VM).

## Syntax

DeCP Live uses a custom syntax for the query, batch result and image result files.

All files have in common a header line and other lines. The fields of the lines have a colon (:) as the field delimiter. 

### Query

The fields of the header line are b, k, number of results and number of images.

The other lines are absolute paths to the query images for this batch.

### Batch result

The fields of the header line are the same as the query header line with the addition of the total time the batch took.

The other lines are absolute paths to the individual image query results for this batch.

### Image result

The fields of the header line are the absolute path to the queried image and the number of features extracted from the image.

The other lines are absolute paths to the result images and the number of features matched.

## Built With

* [Angular 5](https://angular.io/) - Web framwork
* [Materialize](http://materializecss.com/) - CSS framework
    * [ng2-materialize](https://github.com/sherweb/ng2-materialize) - Angular wrapper
* [NodeJS](https://nodejs.org/) - Server runtime
* [Socket IO](https://socket.io/) - Real-time event-based communication
* [Yarn](https://yarnpkg.com/) - Dependency management
* [Apache](https://httpd.apache.org/) - HTTP server
* [Spark](https://spark.apache.org/) - Data processing
   * [BoofCV](https://boofcv.org/) - SIFT Feature Extraction

## Authors

* Björn Þór Jónsson
* [Christian A. Jacobsen](https://github.com/ChristianJacobsen/)
* [Gylfi Þór Guðmundsson](https://github.com/elgerpus)
* [Hilmar Tryggvason](https://github.com/Indexu/)

## Publications 

* Prototyping a Web-Scale Multimedia Retrieval Service Using Spark published in the procedings of the 1st International Conference on Content-Based Multimedia Indexing (CBMI), September, 2018. 

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
