# type: recv
# fiddle: https://fiddle.fastly.dev/fiddle/6db36311
if (
    client.geo.country_code == "AD" ||
    client.geo.country_code == "AF" ||
    client.geo.country_code == "AG" ||
    client.geo.country_code == "AI" ||
    client.geo.country_code == "AL" ||
    client.geo.country_code == "AM" ||
    client.geo.country_code == "AO" ||
    client.geo.country_code == "AQ" ||
    client.geo.country_code == "AR" ||
    client.geo.country_code == "AS" ||
    client.geo.country_code == "AW" ||
    client.geo.country_code == "AX" ||
    client.geo.country_code == "AZ" ||
    client.geo.country_code == "BA" ||
    client.geo.country_code == "BB" ||
    client.geo.country_code == "BD" ||
    client.geo.country_code == "BF" ||
    client.geo.country_code == "BH" ||
    client.geo.country_code == "BI" ||
    client.geo.country_code == "BJ" ||
    client.geo.country_code == "BL" ||
    client.geo.country_code == "BM" ||
    client.geo.country_code == "BN" ||
    client.geo.country_code == "BO" ||
    client.geo.country_code == "BQ" ||
    client.geo.country_code == "BS" ||
    client.geo.country_code == "BT" ||
    client.geo.country_code == "BV" ||
    client.geo.country_code == "BW" ||
    client.geo.country_code == "BY" ||
    client.geo.country_code == "BZ" ||
    client.geo.country_code == "CC" ||
    client.geo.country_code == "CD" ||
    client.geo.country_code == "CF" ||
    client.geo.country_code == "CG" ||
    client.geo.country_code == "CI" ||
    client.geo.country_code == "CK" ||
    client.geo.country_code == "CL" ||
    client.geo.country_code == "CM" ||
    client.geo.country_code == "CO" ||
    client.geo.country_code == "CR" ||
    client.geo.country_code == "CU" ||
    client.geo.country_code == "CV" ||
    client.geo.country_code == "CW" ||
    client.geo.country_code == "CX" ||
    client.geo.country_code == "DJ" ||
    client.geo.country_code == "DM" ||
    client.geo.country_code == "DO" ||
    client.geo.country_code == "DZ" ||
    client.geo.country_code == "EC" ||
    client.geo.country_code == "EG" ||
    client.geo.country_code == "EH" ||
    client.geo.country_code == "ER" ||
    client.geo.country_code == "ET" ||
    client.geo.country_code == "FJ" ||
    client.geo.country_code == "FM" ||
    client.geo.country_code == "FO" ||
    client.geo.country_code == "GA" ||
    client.geo.country_code == "GD" ||
    client.geo.country_code == "GE" ||
    client.geo.country_code == "GF" ||
    client.geo.country_code == "GH" ||
    client.geo.country_code == "GL" ||
    client.geo.country_code == "GM" ||
    client.geo.country_code == "GN" ||
    client.geo.country_code == "GP" ||
    client.geo.country_code == "GQ" ||
    client.geo.country_code == "GS" ||
    client.geo.country_code == "GT" ||
    client.geo.country_code == "GU" ||
    client.geo.country_code == "GW" ||
    client.geo.country_code == "GY" ||
    client.geo.country_code == "HM" ||
    client.geo.country_code == "HN" ||
    client.geo.country_code == "HT" ||
    client.geo.country_code == "ID" ||
    client.geo.country_code == "IO" ||
    client.geo.country_code == "IQ" ||
    client.geo.country_code == "IR" ||
    client.geo.country_code == "JM" ||
    client.geo.country_code == "JO" ||
    client.geo.country_code == "KE" ||
    client.geo.country_code == "KG" ||
    client.geo.country_code == "KH" ||
    client.geo.country_code == "KI" ||
    client.geo.country_code == "KM" ||
    client.geo.country_code == "KN" ||
    client.geo.country_code == "KP" ||
    client.geo.country_code == "KR" ||
    client.geo.country_code == "KW" ||
    client.geo.country_code == "KY" ||
    client.geo.country_code == "KZ" ||
    client.geo.country_code == "LA" ||
    client.geo.country_code == "LB" ||
    client.geo.country_code == "LC" ||
    client.geo.country_code == "LI" ||
    client.geo.country_code == "LK" ||
    client.geo.country_code == "LR" ||
    client.geo.country_code == "LS" ||
    client.geo.country_code == "LY" ||
    client.geo.country_code == "MA" ||
    client.geo.country_code == "MC" ||
    client.geo.country_code == "MD" ||
    client.geo.country_code == "ME" ||
    client.geo.country_code == "MF" ||
    client.geo.country_code == "MG" ||
    client.geo.country_code == "MH" ||
    client.geo.country_code == "MK" ||
    client.geo.country_code == "ML" ||
    client.geo.country_code == "MM" ||
    client.geo.country_code == "MN" ||
    client.geo.country_code == "MO" ||
    client.geo.country_code == "MP" ||
    client.geo.country_code == "MQ" ||
    client.geo.country_code == "MR" ||
    client.geo.country_code == "MS" ||
    client.geo.country_code == "MU" ||
    client.geo.country_code == "MV" ||
    client.geo.country_code == "MW" ||
    client.geo.country_code == "MZ" ||
    client.geo.country_code == "NA" ||
    client.geo.country_code == "NC" ||
    client.geo.country_code == "NE" ||
    client.geo.country_code == "NF" ||
    client.geo.country_code == "NG" ||
    client.geo.country_code == "NI" ||
    client.geo.country_code == "NP" ||
    client.geo.country_code == "NR" ||
    client.geo.country_code == "NU" ||
    client.geo.country_code == "OM" ||
    client.geo.country_code == "PA" ||
    client.geo.country_code == "PE" ||
    client.geo.country_code == "PF" ||
    client.geo.country_code == "PG" ||
    client.geo.country_code == "PH" ||
    client.geo.country_code == "PK" ||
    client.geo.country_code == "PM" ||
    client.geo.country_code == "PN" ||
    client.geo.country_code == "PR" ||
    client.geo.country_code == "PW" ||
    client.geo.country_code == "PY" ||
    client.geo.country_code == "RE" ||
    client.geo.country_code == "RS" ||
    client.geo.country_code == "RW" ||
    client.geo.country_code == "SA" ||
    client.geo.country_code == "SB" ||
    client.geo.country_code == "SC" ||
    client.geo.country_code == "SD" ||
    client.geo.country_code == "SH" ||
    client.geo.country_code == "SJ" ||
    client.geo.country_code == "SL" ||
    client.geo.country_code == "SM" ||
    client.geo.country_code == "SN" ||
    client.geo.country_code == "SO" ||
    client.geo.country_code == "SR" ||
    client.geo.country_code == "SS" ||
    client.geo.country_code == "ST" ||
    client.geo.country_code == "SV" ||
    client.geo.country_code == "SX" ||
    client.geo.country_code == "SY" ||
    client.geo.country_code == "SZ" ||
    client.geo.country_code == "TC" ||
    client.geo.country_code == "TD" ||
    client.geo.country_code == "TF" ||
    client.geo.country_code == "TG" ||
    client.geo.country_code == "TH" ||
    client.geo.country_code == "TJ" ||
    client.geo.country_code == "TK" ||
    client.geo.country_code == "TL" ||
    client.geo.country_code == "TM" ||
    client.geo.country_code == "TN" ||
    client.geo.country_code == "TO" ||
    client.geo.country_code == "TR" ||
    client.geo.country_code == "TT" ||
    client.geo.country_code == "TV" ||
    client.geo.country_code == "TW" ||
    client.geo.country_code == "TZ" ||
    client.geo.country_code == "UA" ||
    client.geo.country_code == "UG" ||
    client.geo.country_code == "UY" ||
    client.geo.country_code == "UZ" ||
    client.geo.country_code == "VA" ||
    client.geo.country_code == "VC" ||
    client.geo.country_code == "VE" ||
    client.geo.country_code == "VG" ||
    client.geo.country_code == "VN" ||
    client.geo.country_code == "VU" ||
    client.geo.country_code == "WF" ||
    client.geo.country_code == "WS" ||
    client.geo.country_code == "YE" ||
    client.geo.country_code == "YT" ||
    client.geo.country_code == "ZM" ||
    client.geo.country_code == "ZW"
) {
    if (req.url ~ "^\/[a-z]{2}/subscribe/digitaledition" || req.url == "/subscribe/digitaledition") {
        error 619;
    }
}

