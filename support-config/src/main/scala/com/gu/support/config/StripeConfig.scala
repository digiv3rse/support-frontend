package com.gu.support.config

import com.gu.i18n.{Country, Currency}
import com.gu.i18n.Currency.AUD
import com.gu.monitoring.SafeLogger
import com.gu.support.workers.{StripePublicKey, StripeSecretKey}
import com.gu.support.zuora.api.{PaymentGateway, StripeGatewayPaymentIntentsAUD, StripeGatewayPaymentIntentsDefault}
import com.typesafe.config.Config

case class StripeConfig(
    defaultAccount: StripeAccountConfig,
    australiaAccount: StripeAccountConfig,
    unitedStatesAccount: StripeAccountConfig,
    version: Option[String],
) {
  private val secretForPublic: Map[StripePublicKey, (StripeSecretKey, PaymentGateway)] = Map(
    defaultAccount.publicKey -> (defaultAccount.secretKey, StripeGatewayPaymentIntentsDefault),
    australiaAccount.publicKey -> (australiaAccount.secretKey, StripeGatewayPaymentIntentsAUD),
    unitedStatesAccount.publicKey -> (unitedStatesAccount.secretKey, StripeGatewayPaymentIntentsDefault), // US currently uses default account for recurring
  )

  def forPublicKey(publicKey: StripePublicKey): (StripeSecretKey, PaymentGateway) =
    secretForPublic(publicKey)

  // fallback for SupportWorkers (recurring products) which don't support a US Stripe account yet.
  def forCurrency(maybeCurrency: Option[Currency]): StripeAccountConfig =
    maybeCurrency match {
      case Some(AUD) =>
        SafeLogger.debug(s"StripeConfig: getting AU stripe account for AUD")
        australiaAccount
      case _ =>
        SafeLogger.debug(s"StripeConfig: getting default stripe account for ${maybeCurrency.map(_.iso).mkString}")
        defaultAccount
    }

  def forCountry(maybeCountry: Option[Country]): StripeAccountConfig =
    maybeCountry match {
      case Some(Country.Australia) =>
        SafeLogger.debug(s"StripeConfig: getting AU stripe account for Australia")
        australiaAccount
      case Some(Country.US) =>
        SafeLogger.debug(s"StripeConfig: getting US stripe account for United States")
        unitedStatesAccount
      case _ =>
        SafeLogger.debug(s"StripeConfig: getting default stripe account for ${maybeCountry.map(_.name).mkString}")
        defaultAccount
    }
}

case class StripeAccountConfig(secretKey: StripeSecretKey, publicKey: StripePublicKey)

class StripeConfigProvider(config: Config, defaultStage: Stage, prefix: String = "stripe")
    extends TouchpointConfigProvider[StripeConfig](config, defaultStage) {
  def fromConfig(config: Config): StripeConfig = StripeConfig(
    accountFromConfig(config, prefix, "default"),
    accountFromConfig(config, prefix, Country.Australia.alpha2),
    accountFromConfig(config, prefix, Country.US.alpha2),
    version = stripeVersion(config),
  )

  private def accountFromConfig(config: Config, prefix: String, country: String) =
    StripeAccountConfig(
      secretKey = StripeSecretKey.get(config.getString(s"$prefix.$country.api.key.secret")),
      publicKey = StripePublicKey.get(config.getString(s"$prefix.$country.api.key.public")),
    )

  private def stripeVersion(config: Config): Option[String] = {
    val stripeVersion = "stripe.api.version"
    if (config.hasPath(stripeVersion)) Some(config.getString(stripeVersion)) else None
  }
}
