// Inserts a property before another in an object literal without breaking references to it
export default function insert(obj, {before, property, value}) {
	let found, temp = {};

	for (let p in obj) {
		if (p === before) {
			found = true;
		}

		if (found) {
			temp[p] = obj[p];
			delete obj[p];
		}
	}

	Object.assign(obj, {property: value, ...temp});
}
