module.exports = {
  "parser": "babel-eslint",
  "env": {
    "browser": true,
    "commonjs": true,
    "es6": true,
    "node": true,
    "mocha": true
  },
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:unicorn/recommended",
    "plugin:promise/recommended"
  ],
  "parserOptions": {
    "ecmaFeatures": {
      "experimentalObjectRestSpread": true,
      "jsx": true,
      "legacyDecorators": true
    },
    "sourceType": "module"
  },
  "plugins": [
    "react",
    "import",
    "unicorn",
    "promise",
    "compat"
  ],
  "settings": {
    "polyfills": ["fetch"],
    "react": {
      "version": "16.4.0"
    },
    "import/resolver": {
      "node": {
        "extensions": [
          ".js",
          ".jsx",
          ".ts",
          ".tsx",
          ".json"
        ]
      }
    }
  },
  "rules": {
    // Possible Errors
    "valid-jsdoc": [
      "error",
      {
        "requireParamDescription": false,
        "requireReturnDescription": false,
        "requireReturnType": true,
        "requireReturn": false
      }
    ],
    "no-async-promise-executor": "error",
    // Best Practices
    "block-scoped-var": "error",
    "consistent-return": "error",
    "no-extra-bind": "error",
    "no-implicit-globals": "error",
    "no-multi-spaces": "error",
    "yoda": "error",
    // Stylistic Issues
    "block-spacing": "error",
    "brace-style": [
      "error",
      "stroustrup",
      {
        "allowSingleLine": true
      }
    ],
    "indent": [
      "error",
      2,
      {
        "SwitchCase": 1
      }
    ],
    "linebreak-style": [
      "error",
      "windows"
    ],
    "quotes": [
      "error",
      "single"
    ],
    "semi": [
      "error",
      "always"
    ],
    "prefer-object-spread": "error",
    "object-curly-spacing": [
      "error",
      "always"
    ],
    "array-bracket-spacing": [
      "error",
      "always",
      {
        "singleValue": true,
        "objectsInArrays": false
      }
    ],
    "space-before-function-paren": [
      "error",
      "never"
    ],
    "space-in-parens": [
      "error",
      "never"
    ],
    "space-infix-ops": "error",
    "keyword-spacing": "error",
    "no-spaced-func": "error",
    "space-before-blocks": "error",
    "space-unary-ops": "error",
    "eqeqeq": ["error", "smart"],
    "prefer-arrow-callback": ["error"],
    "rest-spread-spacing": ["error", "never"],
    "no-confusing-arrow": ["error", {
      "allowParens": true
    }],
    // ECMAScript 6
    "arrow-spacing": "error",
    "no-useless-constructor": "error",
    "no-useless-return": "error",
    "no-var": "error",
    // Unicode
    "unicode-bom": ["error", "never"],
    // Import
    "import/no-unresolved": "error",
    "import/named": "error",
    "import/default": "error",
    "import/namespace": "error",
    "import/export": "error",
    "import/no-absolute-path": "error",
    "import/no-named-as-default": "error",
    "import/no-named-as-default-member": "error",
    "import/no-mutable-exports": "error",
    "import/imports-first": "error",
    "import/no-deprecated": "error",
    "import/order": "error",
    "import/newline-after-import": "error",
    "import/no-named-default": "error",
    "import/no-duplicates": "error",
    "import/no-useless-path-segments": "error",
    // unicorn
    "unicorn/catch-error-name": "off",
    // react
    "react/display-name": "off",
    "react/no-children-prop": "error",
    "react/no-danger": "error",
    "react/no-danger-with-children": "error",
    "react/no-deprecated": 0,
    "react/no-did-mount-set-state": ["error", "disallow-in-func"],
    "react/no-did-update-set-state": ["error", "disallow-in-func"],
    "react/no-multi-comp": ["error", {
      "ignoreStateless": true
    }],
    "react/no-string-refs": "error",
    "react/no-unused-state": "error",
    "react/no-unescaped-entities": "error",
    "react/prefer-es6-class": ["error", "always"],
    "react/prefer-stateless-function": "error",
    "react/self-closing-comp": "error",
    "react/style-prop-object": "error",
    "react/jsx-boolean-value": ["error", "always"],
    "react/jsx-closing-bracket-location": ["error", "after-props"],
    "react/jsx-curly-spacing": ["error", "never"],
    "react/jsx-equals-spacing": ["error", "never"],
    "react/jsx-indent": ["error", 2],
    "react/jsx-indent-props": ["error", 2],
    "react/jsx-key": "error",
    "react/jsx-pascal-case": "error",
    "react/jsx-tag-spacing": ["error", {
      "closingSlash": "never",
      "beforeSelfClosing": "always",
      "afterOpening": "never"
    }],
    "react/sort-comp": [
      "error",
      {
        order: [
          "type-annotations",
          "lifecycle",
          "static-methods",
          "everything-else",
          "rendering"
        ],
        groups: {
          rendering: [
            "/^render.+$/",
            "render"
          ]
        }
      }
    ],
    "react/void-dom-elements-no-children": "error",
    "promise/prefer-await-to-then": "error",
    "promise/prefer-await-to-callbacks": "error",
    "promise/avoid-new": "off",
    // autobind
    "react/jsx-no-bind": ["error", {
      "ignoreRefs": true,
      "allowArrowFunctions": true,
      "allowBind": false
    }],
    "unicorn/prefer-add-event-listener": "off"
  }
};
