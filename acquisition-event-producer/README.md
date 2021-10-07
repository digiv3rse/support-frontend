[ ![Download](https://api.bintray.com/packages/guardian/ophan/acquisition-event-producer-play26/images/download.svg) ](https://bintray.com/guardian/ophan/acquisition-event-producer-play26/_latestVersion)

# acquisition event producer
A tool to submit Acquisition events to Ophan, Google Analytics and BigQuery.

## usage
### in Play projects
Add a dependency on the package that corresponds to your version of Play:

`libraryDependencies += "com.gu" %% "acquisition-event-producer-play26" % "3.0.0"`

### in projects that don't use Play
Import any of the above three projects - the same Circe encoders/decoders are included in each one.

Create an instance of `AcquisitionSubmissionBuilder` in your project. Pass this to `submit` in either `DefaultOphanService` or `MockOphanService` (depending on whether you're in test or live mode) build and (in the case of `DefaultOphanService`) submit the event.

More info: https://mvnrepository.com/artifact/com.typesafe.play/play-json
