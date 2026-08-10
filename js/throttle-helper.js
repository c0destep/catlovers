// Simple throttle function to limit rate of function calls
function throttle (func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      // eslint-disable-next-line no-return-assign
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Export for use in other modules
export const throttleHelper = { throttle };
