package com.gu.i18n

// ISO 3166 alpha-2, up-to-date as of 23/09/2014

case class Country(alpha2: String, name: String, states: Seq[String] = Nil)

object Country {
  val US = Country("US", "United States", states = List(
    "Alaska",
    "Alabama",
    "Arkansas",
    "Arizona",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Guam",
    "Hawaii",
    "Iowa",
    "Idaho",
    "Illinois",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Massachusetts",
    "Maryland",
    "Maine",
    "Michigan",
    "Minnesota",
    "Missouri",
    "Mississippi",
    "Montana",
    "North Carolina",
    "North Dakota",
    "Nebraska",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "Nevada",
    "New York",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Puerto Rico",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Virginia",
    "Virgin Islands",
    "Vermont",
    "Washington",
    "Washington DC",
    "Wisconsin",
    "West Virginia",
    "Wyoming",
    "Armed Forces America",
    "Armed Forces",
    "Armed Forces Pacific"
  ))

  val Canada = Country("CA", "Canada", states = List(
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Northwest Territories",
    "Nunavut",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
    "Yukon"
  ))

  val UK = Country("GB", "United Kingdom")

  val Australia = Country("AU", "Australia", states = List(
    "SA",
    "TAS",
    "NSW",
    "VIC",
    "WA",
    "QLD",
    "ACT",
    "NT",
    "JBT"
  ))

  val NewZealand = Country("NZ", "New Zealand")

  val Ireland = Country("IE", "Ireland")
}
