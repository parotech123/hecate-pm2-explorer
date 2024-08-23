import pm2 from 'pm2';
import readLastLines from 'read-last-lines';
import os from 'os';
import { timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

class PM2Wrapper {
  // Connect to PM2
  async connect() {
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
  disconnect() {
    pm2.disconnect();
  }
  // Start a new process
  async start(options) {
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
  async stop(process) {
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
  async restart(process) {
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
  async delete(process) {
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
  async retrieveLastLines(process, lines, logType = "out") {
    const processDescription = await this.describe(process);
    const logFilePath = logType === "out" ? processDescription.pm2_env?.pm_out_log_path : processDescription.pm2_env?.pm_err_log_path;
    if (!logFilePath) {
      throw new Error(`${logType} log file path not found`);
    }
    return readLastLines.read(logFilePath, lines);
  }
  // Describe a process
  async describe(process) {
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
  async listProcesses() {
    return new Promise((resolve, reject) => {
      pm2.list((err, processDescriptionList) => {
        if (err) {
          console.error(err);
          reject(err);
        }
        const processList = processDescriptionList.map((procDesc) => {
          let data = {
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
            uptime: (/* @__PURE__ */ new Date()).getTime() - procDesc.pm2_env.created_at,
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
            monitor: procDesc.pm2_env.axm_monitor,
            actions: procDesc.pm2_env.axm_actions.filter((action) => !action.action_name.startsWith("km")).map((action) => action.action_name)
          };
          return data;
        });
        resolve(processList);
      });
    });
  }
  performActions(process, action) {
    pm2.sendDataToProcessId(
      process,
      {
        type: "process:msg",
        data: {
          action
        },
        topic: true,
        id: process
      },
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
  flushLogs(name) {
    return new Promise((resolve, reject) => {
      pm2.flush(name, (err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }
  getProcessDescriptionObservable(process, intervalMs = 1e3) {
    return timer(0, intervalMs).pipe(
      switchMap(() => new Promise((resolve) => resolve(this.describe(process))))
    );
  }
  getLocalIPAddress() {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === "IPv4" && alias.address !== "127.0.0.1" && !alias.internal) {
          return alias.address;
        }
      }
    }
    return "";
  }
}

export { PM2Wrapper as P };
//# sourceMappingURL=PM2Wrapper-BvWto0cp.js.map
