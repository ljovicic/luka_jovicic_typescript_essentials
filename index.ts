class Observer<T> {

  private handlers: ObserverHandler<T>;
  private isUnsubscribed: boolean;
  public _unsubscribe: () => void;

  constructor(handlers: ObserverHandler<T>) {
    this.handlers = handlers;
    this.isUnsubscribed = false;
  }

  next(value: T): void {
    if (this.handlers.next && !this.isUnsubscribed) {
      this.handlers.next(value);
    }
  }

  error(error: unknown): void {
    if (!this.isUnsubscribed) {
      if (this.handlers.error) {
        this.handlers.error(error);
      }

      this.unsubscribe();
    }
  }

  complete() : void {
    if (!this.isUnsubscribed) {
      if (this.handlers.complete) {
        this.handlers.complete();
      }

      this.unsubscribe();
    }
  }

  unsubscribe() : void {
    this.isUnsubscribed = true;

    if (this._unsubscribe) {
      this._unsubscribe();
    }
  }
}

class Observable<T> {

  private _subscribe;

  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  static from<T>(values: Array<T>) : Observable<T> {
    return new Observable((observer) => {
      values.forEach((value) => observer.next(value));

      observer.complete();

      return () => {
        console.log('unsubscribed');
      };
    });
  }

  subscribe(obs : ObserverHandler<T>) {
    const observer = new Observer(obs);

    observer._unsubscribe = this._subscribe(observer);

    return ({
      unsubscribe() {
        observer.unsubscribe();
      }
    });
  }
}

type ObserverHandler<T> = {
  next: (value: T) => void,
  error: (error: unknown) => void,
  complete: () => void
}

const HTTP_POST_METHOD = 'POST';
const HTTP_GET_METHOD = 'GET';

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

interface User {
  name: string;
  age: number;
  roles: string[];
  createdAt: Date;
  isDeleated: boolean;
}

interface RequestStatus {
  status: number;
}


const userMock : User = {
  name: 'User Name',
  age: 26,
  roles: [
    'user',
    'admin'
  ],
  createdAt: new Date(),
  isDeleated: false,
};

interface MockRequest {
  method: string;
  host: string;
  path: string;
  body?: User;
  params: { id?: string}
}

const requestsMock : MockRequest[] = [
  {
    method: HTTP_POST_METHOD,
    host: 'service.example',
    path: 'user',
    body: userMock,
    params: {},
  },
  {
    method: HTTP_GET_METHOD,
    host: 'service.example',
    path: 'user',
    params: {
      id: '3f5h67s4s'
    },
  }
];

interface Subscription {
  unsubscribe(): void;
}

const handleRequest = (request: MockRequest) : RequestStatus => {
  // handling of request
  return {status: HTTP_STATUS_OK};
};
const handleError = (error: unknown) : RequestStatus => {
  // handling of error
  return {status: HTTP_STATUS_INTERNAL_SERVER_ERROR};
};

const handleComplete = () : void => console.log('complete');

const requests$ : Observable<MockRequest> = Observable.from(requestsMock);

const subscription : Subscription = requests$.subscribe({
  next: handleRequest,
  error: handleError,
  complete: handleComplete
});

subscription.unsubscribe();
