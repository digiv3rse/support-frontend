package com.gu.model

import com.gu.supporterdata.model.Stage
import com.gu.supporterdata.model.Stage.{DEV, PROD, UAT}

object StageConstructors {

  def fromString(str: String): Option[Stage] =
    List(DEV, UAT, PROD)
      .find(_.value == str)

  def fromEnvironment: Stage =
    (for {
      stageAsString <- Option(System.getenv("Stage"))
      stage <- fromString(stageAsString)
    } yield stage).getOrElse(Stage.DEV)

}
