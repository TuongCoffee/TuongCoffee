// /projects/neural-network/index.js
const { execSync } = require('child_process');

const getTerminalCols = () => {
	try {
		const [rows, cols] = execSync('stty size', { stdio: ['inherit', 'pipe', 'pipe'] })
			.toString()
			.trim()
			.split(' ')
			.map(Number);
		return cols;
	} catch {
		return 0;
	}
}

class NeuralNetwork {
	constructor(layerSizes, itemBits) {
		if (!Array.isArray(layerSizes)) throw new TypeError('Invalid input type. Expected Array.isArray(layerSizes), got !Array.isArray(layerSizes)');
		if (layerSizes.length < 3) throw new RangeError(`Invalid array length. Expected layerSizes.length >= 3, got ${layerSizes.length}`);
		if (!Number.isInteger(itemBits)) throw new TypeError('Invalid input type. Expected Number.isInteger(itemBits), got !Number.isInteger(itemBits)');
		if (itemBits < 1) throw new RangeError(`Invalid integer value. Expected itemBits > 0, got ${itemBits}`);

		this.layerSizes = layerSizes;
		this.weights = [];
		this.biases = [];
		this.itemBits = itemBits;
		this.stopRequested = false;

		for (let i = 1; i < layerSizes.length; i++) {
			const beforeLayerSize = layerSizes[i - 1];
			const afterLayerSize = layerSizes[i];

			const gapWeights = [];
			const gapBiases = [];

			for (let j = 0; j < afterLayerSize; j++) {
				const weightGroup = [];

				const scale = Math.sqrt(1 / beforeLayerSize);
				for (let k = 0; k < beforeLayerSize; k++) {
					weightGroup.push((Math.random() * 2 - 1) * scale);
				}

				gapWeights.push(weightGroup);
				gapBiases.push(Math.random() - 0.5);
			}

			this.biases.push(gapBiases);
			this.weights.push(gapWeights);
		}
	}

	static chunk(arr, size) {
		const result = [];
		for (let i = 0; i < arr.length; i += size) {
			result.push(arr.slice(i, i + size));
		}

		return result;
	}

	static isBinaryArray(arr) {
		return Array.isArray(arr) && arr.length > 0 && arr.every(v => v === 0 || v === 1);
	}

	static stringToBin(str, itemBits) {
		return str.split('').map(s =>
			s.charCodeAt(0).toString(2).padStart(itemBits, '0').split('').map(Number)
		);
	}

	static numberToBin(num, itemBits) {
		return num.toString(2).padStart(itemBits, '0').split('').map(Number);
	}

	static binToNumber(bin) {
		return parseInt(bin.join(''), 2);
	}

	static binToString(bin) {
		return bin.map(b =>
			String.fromCharCode(this.binToNumber(b))
		).join('');
	}

	static toBin(input, itemBits, maxLength) {
		if (typeof input === 'string') {
			let size = 0;
			for (const char of input) {
				size += itemBits;
			}
			if (size > maxLength) throw new RangeError(`Invalid string length. Expected size <= ${maxLength}, got ${size}`);

			return this.stringToBin(input.padEnd(maxLength / itemBits, '\0'), itemBits);
		}
		if (typeof input === 'number') return [this.numberToBin(input, itemBits)];
		if (Array.isArray(input)) return [input];

		throw new TypeError(`Unsupported type: ${input}`);
	}

	#forward(input) {
		if (input.length !== this.layerSizes[0]) throw new RangeError(`Invalid input length. Expected ${this.layerSizes[0]}, got ${input.length}`);

		let previousLayerOutput = input;
		let layersOutput = [input];

		for (let i = 0; i < this.weights.length; i++) {
			const results = [];

			for (let j = 0; j < this.weights[i].length; j++) {
				let sum = this.biases[i][j];

				for (let k = 0; k < this.weights[i][j].length; k++) {
					sum += this.weights[i][j][k] * previousLayerOutput[k];
				}

				results.push(Math.tanh(sum));
			}

			previousLayerOutput = results;
			layersOutput.push(results);
		}

		return layersOutput;
	}

	predict(input, outputType = 0) {
		input = input.flatMap(i => this.constructor.toBin(i, this.itemBits, this.layerSizes[0]).flat());

		if (!this.constructor.isBinaryArray(input)) throw new TypeError('Invalid input. Expected an array of 0/1 values.');
		if (input.length > this.layerSizes[0]) throw new RangeError(`Input too large. Expected <= ${this.layerSizes[0]} bits, got ${input.length}`);

		while (input.length < this.layerSizes[0]) {
			input.push(0);
		}

		input = input.map(v => (v === 0 ? -1 : 1));

		let previousLayerOutput = input;

		for (let i = 0; i < this.weights.length; i++) {
			const results = [];

			for (let j = 0; j < this.weights[i].length; j++) {
				let sum = this.biases[i][j];

				for (let k = 0; k < this.weights[i][j].length; k++) {
					sum += this.weights[i][j][k] * previousLayerOutput[k];
				}

				results.push(Math.tanh(sum));
			}

			previousLayerOutput = results;
		}

		if (outputType === 'debug') return previousLayerOutput;
		if (outputType === 'binary') return previousLayerOutput.map(v => (v > 0 ? 1 : 0));
		if (outputType === 'number') return this.constructor.binToNumber(previousLayerOutput.map(v => (v > 0 ? 1 : 0)).slice(0, this.itemBits));
		if (outputType === 'string') return this.constructor.binToString(this.constructor.chunk(previousLayerOutput.map(v => (v > 0 ? 1 : 0)), this.itemBits)).replace(/\0+$/, '');
		throw new TypeError(`Unsupported output type:x ${outputType}`);
	}

	setData(data) {
		if (!Array.isArray(data)) throw new TypeError('Invalid input type. Expected Array.isArray(data), got !Array.isArray(data)');
		if (data.length === 0) throw new RangeError(`Invalid array length. Expected data.length > 0, got ${data.length}`);

		const flattenedData = [];

		for (let i = 0; i < data.length; i++) {
			let { x, y } = data[i];
			x = x.flatMap(item => this.constructor.toBin(item, this.itemBits, this.layerSizes[0]));
			y = y.flatMap(item => this.constructor.toBin(item, this.itemBits, this.layerSizes.at(-1)));

			if (!Array.isArray(x) || !Array.isArray(y)) throw new TypeError('Invalid input type. Expected Array.isArray(x) and Array.isArray(y).');

			for (const sub of x) {
				if (!this.constructor.isBinaryArray(sub)) throw new TypeError('Invalid input. Expected every sub-array of x to be binary.');
				if (sub.length !== this.itemBits) throw new RangeError(`Invalid array length. Expected sub.length === ${this.itemBits}, got ${sub.length}`);
			}

			for (const sub of y) {
				if (!this.constructor.isBinaryArray(sub)) throw new TypeError('Invalid input. Expected every sub-array of y to be binary.');
				if (sub.length !== this.itemBits) throw new RangeError(`Invalid array length. Expected sub.length === ${this.itemBits}, got ${sub.length}`);
			}

			const flatX = x.flat(), flatY = y.flat();
			if (flatX.length > this.layerSizes[0]) throw new RangeError(`Input too large. Expected <= ${this.layerSizes[0]} bits, got ${flatX.length}`);
			if (flatY.length > this.layerSizes.at(-1)) throw new RangeError(`Output too large. Expected <= ${this.layerSizes.at(-1)} bits, got ${flatY.length}`);

			while (flatX.length < this.layerSizes[0]) flatX.push(0);
			while (flatY.length < this.layerSizes.at(-1)) flatY.push(0);

			flattenedData.push({
				x: flatX.map(v => (
					v === 0 ? -1 : 1
				)),
				y: flatY.map(v => (
					v === 0 ? -1 : 1
				))
			});
		}

		this.data = flattenedData;
	}

	stop() {
		this.stopRequested = true;
	}

	async train(iteration, learningRate = 0.05, debug = false) {
		if (!this.data) throw new Error('Cannot use train(). No data detected');
		if (iteration < -1) throw new RangeError(`Invalid iteration. Expected i >= -1, got ${iteration}`);
		if (debug != true && debug != false) throw new TypeError('Invalid input. Debug needs to be either == false or == true');

		if (iteration == 0) return;

		this.stopRequested = false;

		let startTime;
		if (debug) startTime = Date.now();
		let lastLogTime = 0;

		const logProgress = async (i, totalError, errorCount) => {
			const timeElapsed = (Date.now() - startTime) / 1000;
			const itPerSec = (i + 1) / timeElapsed;

			const logs = [
				`training | i: ${i + 1}/${iteration === -1 ? '∞' : iteration} `+
				`| err: ${totalError.toFixed(3)}/${errorCount} (${(totalError / errorCount).toFixed(3)}) ` +
				`| ${timeElapsed}ms ${itPerSec.toFixed(3)}it/s`,

				`i: ${i + 1}/${iteration === -1 ? '∞' : iteration}` +
				`| err: ${totalError.toFixed(2)}/${errorCount} (${(totalError / errorCount).toFixed(2)}) ` +
				`| ${timeElapsed}ms ${itPerSec.toFixed(2)}it/s`,

				`i: ${i + 1}/${iteration === -1 ? '∞' : iteration}` +
				`| err: ${totalError.toFixed(1)}/${errorCount} (${(totalError / errorCount).toFixed(1)}) ` +
				`| ${timeElapsed / 1000}s ${itPerSec.toFixed(1)}it/s`,

				`i: ${i + 1}/${iteration === -1 ? '∞' : iteration}` +
				`| err: ${(totalError / errorCount).toFixed(2)} ` +
				`| ${timeElapsed / 1000}s ${itPerSec.toFixed(1)}it/s`,

				`${i + 1}/${iteration === -1 ? '∞' : iteration}` +
				`| ${(totalError / errorCount).toFixed(1)} ` +
				`| ${timeElapsed / 1000}s ${itPerSec.toFixed(0)}it/s`,

				`${i + 1}/${iteration === -1 ? '∞' : iteration}` +
				`| ${(totalError / errorCount).toFixed(1)} ` +
				`| ${itPerSec.toFixed(0)}it/s`,

				`${i + 1}/${iteration === -1 ? '∞' : iteration}` +
				`| ${(totalError / errorCount).toFixed(1)}`,

				`${(totalError / errorCount).toFixed(1)}`,
			]

			const cols = getTerminalCols();
			const line = logs.find(c => c.length <= cols) ?? '';
			process.stdout.write('\x1b[s\x1b[1A\x1b[G\x1b[K' + line + '\x1b[u');

			await new Promise(resolve => setImmediate(resolve));
		};

		outer:
		for (let i = 0; iteration === -1 || i < iteration; i++) {
			let totalError = 0;
			let errorCount = 0;

			for (const { x, y } of this.data) {
				if (this.stopRequested) break outer;

				const layersOutput = this.#forward(x);
				const output = layersOutput.at(-1);

				const lastGapIndex = this.weights.length - 1;
				const previousLayer = layersOutput.at(-2);
				const deltas = [];

				for (let j = 0; j < output.length; j++) {
					const error = y[j] - output[j];
					if (debug) {
						totalError += Math.abs(error);
						errorCount++;
					}

					const delta = error * (1 - (output[j]) * (output[j]));
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

						const delta = error * (1 - (afterLayer[j]) * (afterLayer[j]));
						newDeltas.push(delta);

						const inputLayer = layersOutput[gapIndex];
						for (let q = 0; q < this.weights[gapIndex][j].length; q++) {
							this.weights[gapIndex][j][q] += delta * inputLayer[q] * learningRate;
						}
						this.biases[gapIndex][j] += delta * learningRate;
					}

					currentDeltas = newDeltas;
				}

				if (debug) {
					const now = Date.now();
					if (now - lastLogTime >= 100) {
						lastLogTime = now;
						await logProgress(i, totalError, errorCount);
					}
				}
			}
		}
	}
}

const outputType = Object.freeze({
	debug: 'debug',
	binary: 'binary',
	number: 'number',
	string: 'string'
});

module.exports = { NeuralNetwork, outputType };