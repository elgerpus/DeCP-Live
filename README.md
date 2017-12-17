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

## Built With

* [Angular 5](https://angular.io/) - Web framwork
* [Materialize](http://materializecss.com/) - CSS framework
    * [ng2-materialize](https://github.com/sherweb/ng2-materialize) - Angular wrapper
* [NodeJS](https://nodejs.org/) - Server runtime
* [Socket IO](https://socket.io/) - Real-time event-based communication
* [Yarn](https://yarnpkg.com/) - Dependency management
* [Apache](https://httpd.apache.org/) - HTTP server
* [Spark](https://spark.apache.org/) - Data processing

## Authors

* [Christian A. Jacobsen](https://github.com/ChristianJacobsen/)
* [Gylfi Þór Guðmundsson](https://github.com/elgerpus)
* [Hilmar Tryggvason](https://github.com/Indexu/)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
