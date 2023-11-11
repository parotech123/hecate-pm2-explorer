


export function fromByteToHuman(bytes: number) {

	if (!bytes) return ('0B')

	const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
	const number = Math.floor(Math.log(bytes) / Math.log(1024));

	return (bytes / Math.pow(1024, Math.floor(number))).toFixed(2) + ' ' + units[number];


}


export function fromMillisecondsToDDHHmmss(ms: number | undefined) {

	if (!ms) return ('0s')


	const days = Math.floor(ms / (24 * 60 * 60 * 1000));
	const daysms = ms % (24 * 60 * 60 * 1000);
	const hours = Math.floor((daysms) / (60 * 60 * 1000));
	const hoursms = ms % (60 * 60 * 1000);
	const minutes = Math.floor((hoursms) / (60 * 1000));
	const minutesms = ms % (60 * 1000);
	const sec = Math.floor((minutesms) / (1000));

	let array = [days ? days + 'd' : '',
	hours ? hours + 'h' : '',
	minutes ? minutes + 'm' : '',
	sec ? sec + 's' : ''
	];

	return array.join('');




}


import { Observable, Subject } from 'rxjs';
import { takeUntil, repeat, filter } from 'rxjs/operators';

// Custom operator to pause and resume the timer
export function pausable(pauser: Observable<boolean>): any {
	return (source: Observable<any>) => {
		return new Observable<any>((observer) => {
			let isPaused = false;
			let lastValue: any = 0;

			const sourceSubscription = source.subscribe(
				(value) => {
					lastValue = value;
					if (!isPaused) {
						observer.next(value);
					}
				},
				(error) => observer.error(error),
				() => observer.complete()
			);

			const pauserSubscription = pauser.subscribe((paused) => {
				isPaused = paused;
				if (!isPaused && lastValue) {
					observer.next(lastValue);
				}
			});

			return () => {
				sourceSubscription.unsubscribe();
				pauserSubscription.unsubscribe();
			};
		});
	};
}


export function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


export function calculateDivHeight(divId:string) {
	const myDiv = document.getElementById(divId);

	if(!myDiv) return;
	const totalHeight = myDiv.offsetHeight;
	const contentHeight = myDiv.clientHeight;
	const actualContentHeight = myDiv.scrollHeight - parseFloat(getComputedStyle(myDiv).paddingTop) - parseFloat(getComputedStyle(myDiv).paddingBottom);

	console.log("Total height:", totalHeight);
	console.log("Content height:", contentHeight);
	console.log("Actual content height:", actualContentHeight);


	return actualContentHeight+100;
}