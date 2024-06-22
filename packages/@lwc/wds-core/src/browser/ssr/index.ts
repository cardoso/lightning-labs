const WORKER_PATH = import.meta.resolve('./worker.js?env=ssr');

let nextId = 0;
const unresolvedTasks = new Map();

function createWorker(): Promise<any>{
  return new Promise((resolveWorker) => {
    worker = new Worker(WORKER_PATH, { type: 'module' });

    worker.onmessage = ({ data: [taskId, succeeded, payload] }: any) => {
      if (taskId === 'READY') {
        return resolveWorker(worker);
      }

      const task = unresolvedTasks.get(taskId);
      if (!task) {
        // @ts-expect-error
        throw new Error('Unknown transaction resolved with taskId', taskId);
      }
      const { resolveTask, rejectTask } = task;

      if (succeeded) {
        resolveTask(payload);
      } else {
        const parsedPayload = JSON.parse(payload);
        const error = new Error(parsedPayload.message);
        error.stack = parsedPayload.stack;
        rejectTask(error);
      }
    };
  });
}

let worker: any = null;
let workerPromise: any = null;
function getWorker() {
  if (workerPromise) {
    return workerPromise;
  }
  return (workerPromise = createWorker());
}

export function killWorker() {
  workerPromise = null;
  worker.terminate();
}

function task(...args: any[]) {
  const taskId = nextId++;
  // biome-ignore lint/suspicious/noAsyncPromiseExecutor: cleanest way to express this logic
  return new Promise(async (resolveTask, rejectTask) => {
    unresolvedTasks.set(taskId, { resolveTask, rejectTask });
    const worker = await getWorker();
    worker.postMessage([taskId, ...args]);
  });
}

export async function render(componentUrl: string | URL, componentProps: any): Promise<any> {
  const url = new URL(componentUrl, document.location.origin);
  url.searchParams.set('env', 'ssr');
  return await task('render', url.href, componentProps);
}

export async function mock(mockedModuleUrl: string | URL, replacementUrl: any) {
  const url = new URL(mockedModuleUrl, document.location.origin);
  url.searchParams.set('env', 'ssr');
  return await task('mock', url.href, replacementUrl);
}

export async function resetMock(mockedModuleUrl: string | URL) {
  const url = new URL(mockedModuleUrl, document.location.origin);
  url.searchParams.set('env', 'ssr');
  return await task('resetMock', url.href);
}
