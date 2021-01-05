
// // history基本用法是这样的:
// import { createBrowserHistory } from 'history';

// const history = createBrowserHistory();

// // 获取当前location。
// const location = history.location;

// // 监听当前location的更改。
// const unlisten = history.listen((location, action) => {
//   // location是一个类似window.location的对象
//   console.log(action, location.pathname, location.state);
// });

// // 使用push、replace和go来导航。
// history.push('/home', { some: 'state' });

// // 若要停止监听，请调用listen()返回的函数.
// unlisten();




type Events<F> = {
  length: number;
  push: (fn: F) => () => void;
  call: (arg: any) => void;
};

function createEvents<F extends Function>(): Events<F> {
  let handlers: F[] = [];

  return {
    get length() {
      return handlers.length;
    },
    push(fn: F) {
      handlers.push(fn);
      return function() {
        handlers = handlers.filter(handler => handler !== fn);
      };
    },
    call(arg) {
      handlers.forEach(fn => fn && fn(arg));
    }
  };
}

function createBrowserHistory() {
  const listeners = createEvents();
  let location = {
    pathname: '/',
  };

  // 路由变化时的回调
  const handlePop = function () {
    const currentLocation = {
      pathname: window.location.pathname
    }
    listeners.call(currentLocation);     // 路由变化时执行回调
  }

  // 监听popstate事件
  // 注意pushState和replaceState并不会触发popstate
  // 但是浏览器的前进后退会触发popstate
  // 我们这里监听这个事件是为了处理浏览器的前进后退
  window.addEventListener('popstate', handlePop);

  // 返回的history上有个listen方法
  const history = {
    listen(listener) {
      return listeners.push(listener);
    },
    push(url){
      // 注意pushState和replaceState并不会触发popstate
      // 依然这样做，为了保持state栈的一致性
      const history = window.history;
      history.pushState(null,'',url);
      // 由于push 不能出发popstate，需要我们手动调用回调函数
      location = {pathname: url};
      listeners.call(location);
    },
    location
  }

  return history;
}