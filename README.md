# DeCP Live

A web-interface for DeCP, a high-throughput CBIR system

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

In order to run DeCP and DeCP Live on your own machine, you will need to follow the setup guide specified in the [INSTALL.md](INSTALL.md) file.

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

* [Christian A. Jacobsen](https://github.com/ChristianJacobsen/)
* [Gylfi Þór Guðmundsson](https://github.com/elgerpus)
* [Hilmar Tryggvason](https://github.com/Indexu/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
