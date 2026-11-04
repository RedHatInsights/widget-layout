module.exports = {
  extends: '@redhat-cloud-services/eslint-config-redhat-cloud-services',
  globals: {
    insights: 'readonly',
    shallow: 'readonly',
    render: 'readonly',
    mount: 'readonly',
  },
  overrides: [
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint', 'i18next'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        'react/prop-types': 'off',
        'i18next/no-literal-string': ['error', {
          mode: 'jsx-only',
          words: {
            exclude: [/^alignItems[A-Z]/, /^spaceItems[A-Z]/, /^justifyContent[A-Z]/, /^flexWrap[A-Z]/, /^inset[A-Z]/, /^spacer[A-Z]/, /^gap[A-Z]/, /^flex_[0-9]+$/, /^flexDefault$/, /^flexNone$/, /^grow$/, /^shrink$/, /^noPadding$/, /^nowrap$/, /^compact$/, /^alignSelf[A-Z]/, /^100%$/, /^calc\(/, /^var\(/, /^\d+px$/, 'locale', 'defaultLocale', 'titleIconVariant', 'iconVariant', 'eventKey', 'serviceName', 'validated', 'rel', 'role', 'popperProps', 'appendTo', 'none', 'polite', 'off', /^right$/, /^left$/, /^center$/, /^top$/, /^bottom$/, /^danger$/, /^success$/, /^warning$/, /^info$/, /^default$/, /^pending$/, /^approved$/, /^denied$/, /^create$/, /^edit$/, /^cancel$/, /^_blank$/, /^noopener$/, /^hover$/, /^click$/, /^single$/, /^multiple$/, /^, $/, /^: $/, /^a$/, /^#$/, /^loading$/, /^empty$/, /^expanded$/, /^collapsed$/, /^selected$/, /^not selected$/, /^[A-Z][A-Za-z0-9]*:[A-Z][A-Za-z0-9]+$/, /^[0-9]+%$/, /^[0-9]{6,}$/, 'Allow', 'Deny', /^#[0-9A-Fa-f]{3,8}$/, /^text$/, /^checkbox$/, /^radio$/, /^date$/, /^time$/, /^inset[A-Z0-9]/, /^pagination$/, /^small$/, /^vertical$/, /^2Col$/, /^3Col$/, /^pristine$/, /^validating$/, /^invalid$/, /^name$/, /^rhel$/, /^\u2022+$/, /^https?:\/\//, /^pf-v6-u-[a-z0-9-]+$/, /^redhat-icon$/, /^\/apps\//, /^end$/, /^start$/, /^orange$/, /^green$/, /^blue$/, /^red$/, /^grey$/, /^purple$/, /^cyan$/, /^se$/, /^sw$/, /^ne$/, /^nw$/],
          },
          'jsx-attributes': {
            exclude: ['className', 'styleName', 'style', 'type', 'key', 'id', 'width', 'height', 'name', 'href', 'to', 'path', 'target', 'variant', 'component', 'form', 'fieldId', 'filterId', 'widgetId', 'ouiaId', 'data-testid', 'testId', 'autoFocus', 'headingLevel', 'size', 'sx', 'direction', 'position', 'align', 'icon', 'variantPrefix', 'isCompact', 'locale', 'defaultLocale', 'aria-describedby', 'aria-labelledby', 'titleIconVariant', 'iconVariant', 'placeholder', 'eventKey', 'labelId', 'serviceName', 'sortableColumns', 'validated', 'rel', 'role', 'popperProps', 'appendTo', 'dataLabel', 'expandId', 'titleId', 'apiPath', 'data-ouia-component-id', 'data-ouia-component-type', 'aria-controls', 'autoComplete', 'breakpoint', 'wrapModifier', 'currency', 'dateFormat', 'validateOnMount', 'noValidate', 'scope', 'module', 'data-hcc-.*', 'iconPosition', 'color', 'isCurrent', 'spellCheck', 'md', 'sm', 'lg', 'xl', 'xl2', 'layoutType', 'shape', 'unselectable', 'itemId', 'direction', 'modifier'],
          },
          callees: {
            exclude: ['join', 'includes', 'openWizard', 'setFilter', 'stateDispatch', 'debouncedFiltering', 'navigate', 'dispatch', 'onChange', 'change', 'bodyVariants', 'console.log'],
          },
        }],
      },
      excludedFiles: ['src/test/**', '**/*.stories.*', '**/*.test.*', '**/__tests__/**', 'cypress/**'],
    },
  ],
  rules: {
    'sort-imports': [
      'error',
      {
        ignoreDeclarationSort: true,
      },
    ],
    'rulesdir/forbid-pf-relative-imports': 'off',
  },
};
