module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: '80',
          firefox: '72',
        },
      },
    ],
  ],
};
