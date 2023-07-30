import { writable } from 'svelte/store'

interface Id {
	pid: number
}

export function CrudStore<T extends Id>() {

	const { subscribe, set, update } = writable<T[]>(undefined);

	return {
		subscribe,
		replace: (replaceVal: T | T[]) => update(array => {

			if (!array) array = []
			if (replaceVal instanceof Array) {
				array = [...array.filter(a => replaceVal.map(v => v.pid).includes(a.pid) == false), ...replaceVal]

			} else {

				let index = array.findIndex(a => a.pid == replaceVal.pid)

				if (index == -1) {
					array = [...array, replaceVal]
				} else {

					array[index] = replaceVal
					array = [...array]
				}

			}

			return array
		}),
		remove: (removeVal: T | T[] | string | string[]) => update(array => {

			console.log('removeVal', removeVal)
			//@ts-ignore
			if (!removeVal || !array || (removeVal.length && removeVal.length == 0)) return (array ?? [])

			let idsToRemove: string[]


			if (removeVal instanceof Array) {

				//@ts-ignore
				idsToRemove = (typeof removeVal[0] == "string") ? removeVal : removeVal.map(r => r.pid)


			} else {

				//@ts-ignore
				idsToRemove = (typeof removeVal == "string") ? [removeVal] : [removeVal.pid]
			}

			console.log('idsToRemove', idsToRemove)

			array = [...array.filter(a => !idsToRemove.includes(a.pid.toString())),]


			return array
		}),
		load: (toLoad: T[]) => set(toLoad),
		reset: () => set([]),
		init: async (caller:any, params:any) => {

			let data = await caller(params)

			if (data) {
				set(data)
			} else {
				throw new Error("Error with call")
			}
		},


	};
}






export const createCrudStore = CrudStore()





