// /projects/neural-network/index.js
class NeuralNetwork {
	constructor(layerSizes, bitSize) {
		if (!Array.isArray(layerSizes)) throw new TypeError('Invalid input type. Expected Array.isArray(layerSizes), got !Array.isArray(layerSizes)');
		if (layerSizes.length < 3) throw new RangeError(`Invalid array length. Expected layerSizes.length >= 3, got ${layerSizes.length}`);
		if (!Number.isInteger(bitSize)) throw new TypeError('Invalid input type. Expected Number.isInteger(bitSize), got !Number.isInteger(bitSize)');
		if (bitSize < 1) throw new RangeError(`Invalid integer value. Expected bitSize > 0, got ${bitSize}`);

		this.layerSizes = layerSizes;
		this.weights = [];
		this.biases = [];
		this.bitSize = bitSize;

		for (let i = 1; i < layerSizes.length; i++) {
			const beforeLayerSize = layerSizes[i - 1];
			const afterLayerSize = layerSizes[i];

			const gapWeights = [];
			const gapBiases = [];

			for (let j = 0; j < afterLayerSize; j++) {
				const weightGroup = [];

				for (let k = 0; k < beforeLayerSize; k++) {
					weightGroup.push(Math.random() - 0.5);
				}

				gapWeights.push(weightGroup);
				gapBiases.push(Math.random() - 0.5);
			}

			this.biases.push(gapBiases);
			this.weights.push(gapWeights);
		}
	}

	sigmoid(x) {
		return 1 / (1 + Math.exp(-x));
	}
	sigmoidDerivative(x) {
		return x * (1 - x);
	}

	isBinaryArray(arr) {
		return Array.isArray(arr) && arr.length > 0 && arr.every(v => v === 0 || v === 1);
	}

	forward(input) {
		if (!this.isBinaryArray(input)) throw new TypeError('Invalid input. Expected an array of 0/1 values.');
		if (input.length !== this.layerSizes[0]) throw new RangeError(`Invalid array length. Expected input.length === ${this.layerSizes[0]}, got ${input.length}`);

		let previousLayerOutput = input;
		let layersOutput = [input];

		for (let i = 0; i < this.weights.length; i++) {
			const results = [];

			for (let j = 0; j < this.weights[i].length; j++) {
				let sum = this.biases[i][j];

				for (let k = 0; k < this.weights[i][j].length; k++) {
					sum += this.weights[i][j][k] * previousLayerOutput[k];
				}

				results.push(this.sigmoid(sum));
			}

			previousLayerOutput = results;
			layersOutput.push(results);
		}

		return layersOutput;
	}

	predict(input) {
		input = input.flat();

		if (!this.isBinaryArray(input)) throw new TypeError('Invalid input. Expected an array of 0/1 values.');
		if (input.length !== this.layerSizes[0]) throw new RangeError(`Invalid array length. Expected input.length === ${this.layerSizes[0]}, got ${input.length}`);

		let previousLayerOutput = input;

		for (let i = 0; i < this.weights.length; i++) {
			const results = [];

			for (let j = 0; j < this.weights[i].length; j++) {
				let sum = this.biases[i][j];

				for (let k = 0; k < this.weights[i][j].length; k++) {
					sum += this.weights[i][j][k] * previousLayerOutput[k];
				}

				results.push(this.sigmoid(sum));
			}

			previousLayerOutput = results;
		}

		return previousLayerOutput.map(v => (v < 0.5 ? 0 : 1));
	}

	setData(data) {
		if (!Array.isArray(data)) throw new TypeError('Invalid input type. Expected Array.isArray(data), got !Array.isArray(data)');
		if (data.length === 0) throw new RangeError(`Invalid array length. Expected data.length > 0, got ${data.length}`);

		const flattenedData = [];

		for (let i = 0; i < data.length; i++) {
			const { x, y } = data[i];
			if (!Array.isArray(x) || !Array.isArray(y)) throw new TypeError('Invalid input type. Expected Array.isArray(x) and Array.isArray(y).');

			for (const sub of x) {
				if (!this.isBinaryArray(sub)) throw new TypeError('Invalid input. Expected every sub-array of x to be binary.');
				if (sub.length !== this.bitSize) throw new RangeError(`Invalid array length. Expected sub.length === ${this.bitSize}, got ${sub.length}`);
			}

			for (const sub of y) {
				if (!this.isBinaryArray(sub)) throw new TypeError('Invalid input. Expected every sub-array of y to be binary.');
				if (sub.length !== this.bitSize) throw new RangeError(`Invalid array length. Expected sub.length === ${this.bitSize}, got ${sub.length}`);
			}

			flattenedData.push({ x: x.flat(), y: y.flat() });
		}

		this.data = flattenedData;
	}

	async train(iteration, learningRate = 0.5) {
		if (!this.data) throw new Error('Cannot read property of undefined (reading this.data)');

		process.on('SIGINT', () => {
			process.exit(0);
		});

		for (let i = 0; interation === -1 || i < iteration; i++) {
			for (const { x, y } of this.data) {
				const layersOutput = this.forward(x);
				const output = layersOutput.at(-1);

				const lastGapIndex = this.weights.length - 1;
				const previousLayer = layersOutput.at(-2);
				const deltas = [];

				for (let j = 0; j < output.length; j++) {
					const error = y[j] - output[j];
					const delta = error * this.sigmoidDerivative(output[j]);
					deltas.push(delta);

					for (let k = 0; k < this.weights[lastGapIndex][j].length; k++) {
						this.weights[lastGapIndex][j][k] += delta * previousLayer[k] * learningRate;
					}

					this.biases[lastGapIndex][j] += delta * learningRate;
				}

				let currentDeltas = deltas;

				for (let gapIndex = this.weights.length - 2; gapIndex >= 0; gapIndex--) {
					const afterLayer = layersOutput[gapIndex + 1];
					const newDeltas = [];

					for (let j = 0; j < afterLayer.length; j++) {
						let error = 0;
						for (let k = 0; k < currentDeltas.length; k++) {
							error += currentDeltas[k] * this.weights[gapIndex + 1][k][j];
						}

						const delta = error * this.sigmoidDerivative(afterLayer[j]);
						newDeltas.push(delta);

						const inputLayer = layersOutput[gapIndex];
						for (let q = 0; q < this.weights[gapIndex][j].length; q++) {
							this.weights[gapIndex][j][q] += delta * inputLayer[q] * learningRate;
						}
						this.biases[gapIndex][j] += delta * learningRate;
					}

					currentDeltas = newDeltas;
				}
			}

			await new Promise(resolve => setImmediate(resolve));
		}
	}
}

module.exports = { NeuralNetwork };
