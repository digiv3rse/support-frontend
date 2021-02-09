package com.gu.lambdas

import com.gu.model.Stage.DEV
import com.gu.model.states.QueryType.Incremental
import com.gu.test.tags.annotations.IntegrationTest
import org.scalatest.flatspec.AsyncFlatSpec
import org.scalatest.matchers.should.Matchers

import java.time.LocalDate

@IntegrationTest
class QueryZuoraLambdaSpec extends AsyncFlatSpec with Matchers {

  // this doesn't really test anything it is just to aid in local development
  QueryZuoraLambda.getClass.getSimpleName should "be able to run a query" in {
    QueryZuoraLambda.queryZuora(DEV, Incremental).map(
      resultState =>
        resultState.attemptedQueryTime.toLocalDate shouldBe LocalDate.now
    )
  }
}
