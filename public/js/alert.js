/* eslint-disable */
export const showAlert = (type, message) => {
    const el =  document.createElement('div');
    el.className = `alert alert--${type}`
    el.innerHTML = message
    document.querySelector('body').insertAdjacentElement('afterbegin',el)
}

export const hideAlert = () => {
    const el = document.querySelector('.alert');
    el.parentElement.removeChild(el)
}

export const flashAlert = (type,message,postAction,time=5000) => {
    showAlert(type,message);
    setTimeout(() => {
        hideAlert()
        
        if(postAction.action === 'assign') return window.location.assign(postAction.url)

        if(postAction.action === 'reload') return window.location.reload(true);
    },time)
}