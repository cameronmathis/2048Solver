# 2048 Solver

[![license](https://img.shields.io/github/license/cameronmathis/2048Solver)](LICENSE)
[![CodeQL](https://github.com/cameronmathis/2048Solver/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/cameronmathis/2048Solver/actions/workflows/codeql-analysis.yml)
[![CodeFactor](https://www.codefactor.io/repository/github/cameronmathis/2048Solver/badge)](https://www.codefactor.io/repository/github/cameronmathis/2048Solver)

## Table of contents

- [General info](#general-info)
- [Setup](#setup)
- [Software details](#software-details)
- [Status](#status)
- [Contact](#contact)

## General info

This project applies a genetic algorithm to the 2048 game, evolving strategies that maximize score and improve tile placement over time. Instead of hard-coding heuristics, the solver uses an evolutionary process where genomes (sets of heuristic weights) are evaluated, selected, and mutated across generations. The goal is to consistently discover strategies that reach the 2048 tile and beyond.

My personal benchmark is to evolve a genome capable of averaging scores above 47,012 (my current best run).

## Setup

To run this project:

1. Clone the repository

1. Install dependencies:

```bash
npm install
```

1. Start the solver:

```bash
npm start
```

## Software details

- Language: TypeScript
- Runtime: Node.js
- Key Features:
  - Genetic Algorithm implementation
  - 2048 game simulation
  - Heuristic-based bot
  - Performance logging

## Status

Version: 0.1.0  
Project is: _in progress_

## Contact

Created by [@cameronmathis](https://github.com/cameronmathis/) - feel free to contact me!
