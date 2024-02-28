import pm2, { type StartOptions, type Proc, type ProcessDescription } from 'pm2';
import readLastLines from 'read-last-lines';
import os from 'os';
import { Observable, timer, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface ProcessData {
    name: string;
    pid: number;
    memory: number;
    cpu: number;
    pm_id: number;
    ip: string;
    istances?: number;
    outlogPath?: string;
    errlogPath?: string;
    pidPath?: string;
    status?: string;
    uptime?: number;
    restarts?: number;
    unstableRestarts?: number;
    version?: string;
    nodeVersion?: string;
    watch?: boolean;
    autorestart?: boolean;
    execMode?: string;
    execInterpreteur?: string;
    execPath?: string;
    createdAt?: number;
    monitor:{[keyof: string]: any}
}


export class PM2Wrapper {
    // Connect to PM2
    async connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            pm2.connect((err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            });
        });
    }

    // Disconnect from PM2
    disconnect(): void {
        pm2.disconnect();
    }

    // Start a new process
    async start(options: StartOptions): Promise<Proc> {
        return new Promise((resolve, reject) => {
            pm2.start(options, (err, proc) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve(proc);
            });
        });
    }

    // Stop a process
    async stop(process: string | number): Promise<void> {
        return new Promise((resolve, reject) => {
            pm2.stop(process, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            });
        });
    }

 

    // Restart a process
    async restart(process: string | number): Promise<void> {
        return new Promise((resolve, reject) => {
            pm2.restart(process, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            });
        });
    }

    // Delete a process
    async delete(process: string | number): Promise<void> {
        return new Promise((resolve, reject) => {
            pm2.delete(process, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }
                resolve();
            });
        });
    }

    // Retrieve last N lines of logs
    async retrieveLastLines(process: string | number, lines: number, logType: 'out' | 'err' = 'out'): Promise<string> {
        const processDescription = await this.describe(process);
        const logFilePath = logType === 'out' ? processDescription.pm2_env?.pm_out_log_path : processDescription.pm2_env?.pm_err_log_path;

        if (!logFilePath) {
            throw new Error(`${logType} log file path not found`);
        }

        return readLastLines.read(logFilePath, lines);
    }

    // Describe a process
     async describe(process: string | number): Promise<ProcessDescription> {
        return new Promise((resolve, reject) => {
            pm2.describe(process, (err, processDescriptionList) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }

                const processDescription = processDescriptionList[0];
                if (!processDescription) {
                    reject(new Error(`Process ${process} not found`));
                    return;
                }

                resolve(processDescription);
            });
        });
    }

    // Retrieve process list
    async listProcesses(): Promise<ProcessData[]> {
        return new Promise((resolve, reject) => {
            pm2.list((err: any, processDescriptionList: any[]) => {
                if (err) {
                    console.error(err);
                    reject(err);
                }

                const processList: ProcessData[] = processDescriptionList.map(procDesc => {



                    let data: ProcessData = {
                        name: procDesc.name,
                        pid: procDesc.pid,
                        memory: Number(procDesc.monit.memory),
                        cpu: procDesc.monit.cpu,
                        pm_id: procDesc.pm_id,
                        ip: this.getLocalIPAddress(),
                        istances: procDesc.pm2_env.instances,
                        outlogPath: procDesc.pm2_env.pm_out_log_path,
                        errlogPath: procDesc.pm2_env.pm_err_log_path,
                        pidPath: procDesc.pm2_env.pm_pid_path,
                        status: procDesc.pm2_env.status,
                        uptime: new Date().getTime() - procDesc.pm2_env.created_at,
                        restarts: procDesc.pm2_env.restart_time,
                        unstableRestarts: procDesc.pm2_env.unstable_restarts,
                        version: procDesc.pm2_env.version,
                        nodeVersion: procDesc.pm2_env.node_version,
                        watch: procDesc.pm2_env.watch,
                        autorestart: procDesc.pm2_env.autorestart,
                        execMode: procDesc.pm2_env.exec_mode,
                        execInterpreteur: procDesc.pm2_env.exec_interpreter,
                        execPath: procDesc.pm2_env.pm_exec_path,
                        createdAt: procDesc.pm2_env.created_at,
                        monitor:procDesc.pm2_env.axm_monitor,

                    };


                    return data
                });

                resolve(processList);
            });
        });
    }

    flushLogs(name: string): Promise<void> {
        return new Promise((resolve, reject) => {
            pm2.flush(name, err => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    getProcessDescriptionObservable(process: string | number, intervalMs: number = 1000): Observable<ProcessDescription> {
        return timer(0, intervalMs).pipe(
            switchMap(() => new Promise<ProcessDescription>(resolve => resolve(this.describe(process))))
        );
    }


    getLocalIPAddress(): string {
        const interfaces = os.networkInterfaces();
        for (const devName in interfaces) {
            const iface = interfaces[devName];

            for (let i = 0; i < iface!.length; i++) {
                const alias = iface![i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                    return alias.address;
                }
            }
        }

        return '';
    }

}
