export function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

export function setCookie(name, value, days) {
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
}