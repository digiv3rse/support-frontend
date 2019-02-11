addSbtPlugin("com.typesafe.play" % "sbt-plugin" % "2.6.16")

addSbtPlugin("com.typesafe.sbt" % "sbt-digest" % "1.1.4")

addSbtPlugin("com.eed3si9n" % "sbt-buildinfo" % "0.7.0")

addSbtPlugin("com.eed3si9n" % "sbt-assembly" % "0.14.5")

libraryDependencies += "org.vafer" % "jdeb" % "1.5" artifacts (Artifact("jdeb", "jar", "jar"))

addSbtPlugin("org.scalastyle" %% "scalastyle-sbt-plugin" % "1.0.0" excludeAll ExclusionRule(organization = "com.danieltrinh"))

addSbtPlugin("com.gu" % "sbt-riffraff-artifact" % "1.1.3")

addSbtPlugin("com.timushev.sbt" % "sbt-updates" % "0.3.3")

addSbtPlugin("net.vonbuchholtz" % "sbt-dependency-check" % "0.2.0")

// dependency tracker plugin - needed for snyk cli integration
addSbtPlugin("net.virtual-void" % "sbt-dependency-graph" % "0.9.0")
