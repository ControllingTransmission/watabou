# Watabou Visuals

A Three.js visualization application featuring interactive visual effects and shader manipulations.

**[🚀 Live Demo](https://controllingtransmission.github.io/watabou/)**

![A GIF file showing a demo of Watabou Visuals](https://github.com/ControllingTransmission/watabou/blob/master/demo.gif "Interactive Three.js visualization with lighting effects, particle systems, and custom shaders.")

## About

Watabou Visuals is an interactive Three.js application that showcases:
- Real-time shader effects (pixelation, RGB shift, threshold effects)
- Dynamic lighting with spotlights, directional lights, and ambient lighting
- Particle systems with custom materials
- Interactive controls via keyboard and mouse
- Various forest textures and visual compositions

## Features

- ES6 support with [babel-loader](https://github.com/babel/babel-loader)
- Code formatting with [prettier](https://github.com/prettier/prettier)
- CSS support with [style-loader](https://github.com/webpack-contrib/style-loader)
  and [css-loader](https://github.com/webpack-contrib/css-loader)
- CSS linting with [stylelint](https://stylelint.io/)
- Controls with [orbit-controls-es6](https://www.npmjs.com/package/orbit-controls-es6)
- GUI with [dat.GUI](https://github.com/dataarts/dat.gui)
- GLSL shaders support via [webpack-glsl-loader](https://www.npmjs.com/package/webpack-glsl-loader)
- Tests with [jest](https://jestjs.io/en/), [jest-dom](https://github.com/gnapse/jest-dom)
- Webpack configuration with:
  - [@packtracker/webpack-plugin](https://github.com/packtracker/webpack-plugin) (bundle sizes [here](https://app.packtracker.io/organizations/129/projects/110))
  - [clean-webpack-plugin](https://github.com/johnagan/clean-webpack-plugin)
  - [compression-webpack-plugin](https://github.com/webpack-contrib/compression-webpack-plugin)
  - [duplicate-package-checker-webpack-plugin](https://github.com/darrenscerri/duplicate-package-checker-webpack-plugin)
  - [favicons-webpack-plugin](https://github.com/jantimon/favicons-webpack-plugin)
  - [html-webpack-plugin](https://github.com/jantimon/html-webpack-plugin)
  - [mini-css-extract-plugin](https://github.com/webpack-contrib/mini-css-extract-plugin)
  - [webpack-bundle-analyzer](https://github.com/th0r/webpack-bundle-analyzer)
  - [webpack-glsl-loader](https://github.com/grieve/webpack-glsl-loader)

## Installation

```shell
git clone git@github.com:ControllingTransmission/watabou.git
cd watabou
yarn
```

## Usage (development)

Run `webpack-dev-server` (all bundles will be served from memory)

```shell
yarn dev
```

Go to `localhost:8080` to see your project live!

## Usage (production)

Generate all js/css bundles:

```shell
yarn build
```

The built files will be in the `build/` directory, ready for deployment.

### GitHub Pages Deployment

This project automatically deploys to GitHub Pages via GitHub Actions. Every push to the `master` branch triggers a build and deployment to `https://controllingtransmission.github.io/watabou/`.

## Other

Analyze webpack bundles offline:

```shell
yarn build  # to generate build/stats.json
yarn stats  # uses webpack-bundle-analyzer as CLI
```

or push to a CI (e.g. [Travis CI](https://travis-ci.com/)), let it build your project and analyze your bundles online at [packtracker.io](https://packtracker.io/).

Check outdated dependencies:

```shell
yarn ncu
```

Update all outdated dependencies at once:

```shell
yarn ncuu
```

## TODO

Some desired things in our new version here:

* Move object generation and control into a required file. Too much in application.js right now.
* Force lint success on commit.
* Write some documentation on how to use the linter to begin with.
* Add gamepad support: https://github.com/carldanley/node-gamepad

## Credits

The setup of this starter project was inspired by two snippets on Codepen: [this one](http://codepen.io/mo4_9/pen/VjqRQX) and [this one](https://codepen.io/iamphill/pen/jPYorE).

I understood how to work with lights and camera helpers thanks to
[this snippet](http://jsfiddle.net/f17Lz5ux/5131/) on JSFiddle.

The code for `vertexShader.glsl` and `fragmentShader.glsl` is taken from
[this blog post](http://blog.cjgammon.com/threejs-custom-shader-material).

The star used in the particle system is the PNG preview of [this image](https://commons.wikimedia.org/wiki/File:Star_icon-72a7cf.svg) by Offnfopt
(Public domain or CC0, via Wikimedia Commons).
