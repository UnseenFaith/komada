const path = require("path");
const fs = require("fs");
const I18n = require("node-i18n");

exports.init = (client) => {
  // Prepare bundles
  const bundles = {
    fr: {
      currency: "CAD",
      locale: "fr-FR",
      strings: {},
    },
    en: {
      currency: "USD",
      locale: "en-US",
      strings: {},
    },
  };

  // Get strings from localized JSON files
  const dir = path.resolve(`${client.coreBaseDir}/locs/`);
  for (const lang in bundles) {
    const bundleContents = JSON.parse(fs.readFileSync(`${dir}/${bundles[lang].locale}.json`, "utf8"));
    bundles[lang].strings = bundleContents;
  }
  I18n.init({ bundles, defaultCurrency: "USD" });
  return I18n;
};

exports.use = I18n.use;
exports.translate = I18n.translate;
