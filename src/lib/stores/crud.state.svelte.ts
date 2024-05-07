export class CrudState<T> {




	data = $state<T[] | null>(null);
	_id: keyof T;

	selected = $state<T | null>(null);
	loading = $state<boolean>(false);

	constructor(_id: keyof T) {
		this._id = _id;

	}

	replace(dataToReplace: T[] | T) {

		if (Array.isArray(dataToReplace)) {

			this.data = [...dataToReplace, ...(this.data ? this.data.filter(d => dataToReplace.map(dr => dr[this._id]).includes(d[this._id])) : [])]

		} else {

			this.data = [...(this.data ? this.data.filter(d => d[this._id] !== dataToReplace[this._id]) : []), dataToReplace]

		}


	}


	remove(dataToRemove: T | T[]) {


		if (!this.data) return

		if (Array.isArray(dataToRemove)) {

			this.data = this.data.filter(d => !dataToRemove.map(dr => dr[this._id]).includes(d[this._id]))

		} else {

			this.data =  this.data.filter(d => d[this._id] !== dataToRemove[this._id]) 

		}
	}

	reset() {
		this.data = null
	}

	add(dataToAdd: T | T[]) {
		
		if (Array.isArray(dataToAdd)) {

			this.data = [...(this.data??[]), ...dataToAdd]

		} else {

			this.data = [...(this.data ?? []), dataToAdd]

		}
	}


}


