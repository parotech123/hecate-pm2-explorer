import type { ProcessData } from "./PM2Wrapper";
import { processesStore } from './process.store';
import { logsStore } from './logs.store';
import { errorsStore } from "./errors.store";

export async function updateProcesses() {
	const res = await fetch('/api/processes');
	const data = await res.json();
	console.log(data);
	processesStore.replace(data);
}

export async function deleteProcess(p: ProcessData) {
    await fetch(`/api/processes/delete`, {
        method: 'POST',
        body: JSON.stringify({
            pid:p.pid
        }),
        headers: {
            'Content-Type': 'application/json',
        }

    });
    await updateProcesses();
}


export async function loadProcessesFromStorage() {
    const savedProcesses = localStorage.getItem('processes');

    if (savedProcesses) {
        const ips = JSON.parse(savedProcesses);

        for (let ipInfo of ips) {
            const res = await fetch(`/api/processes/${ipInfo.ip}`);
            const data = await res.json();

            processesStore.replace(data);
        }
    }
};


export async function fetchProcesses(subnet:string) {
    const res = await fetch(`/api/remoteProcesses?subnet=${subnet}`);
    const data = await res.json();
    console.log(data.allProcesses);
    localStorage.setItem('processes', JSON.stringify(data.allProcesses));
	processesStore.replace(data.allProcesses);
};


export async function flushLogs(p:ProcessData) {
    const res = await fetch(`/api/processes/logs/${p.name}/flush`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name
        })
    });
    if (res.ok) {
        alert('Logs flushed');
    }
}


export async function fetchLogs(p:ProcessData) {
    const res = await fetch(`/api/processes/logs/${p.name}`);
    const data = await res.json();
    console.log(data);
    logsStore.set(data.outLogs.split('\n'));
    errorsStore.set(data.errLogs.split('\n'));
}