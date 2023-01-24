function getUserInfo() {
    if (window.location.host === 'twitter.com') {
        let name = window.location.pathname.replace('/', '')
        let followers = document.querySelector(`a[href='/${name}/followers']`);
        let text = document.querySelector(`div[aria-label="主页时间线"]`).innerText.split('@' + name)[1].replace(/\n推文\n推文和回复\n媒体\n喜欢.*/ig, '').trim();
        if (followers) followers = followers.innerText;
        return text
    }
}


export { getUserInfo };