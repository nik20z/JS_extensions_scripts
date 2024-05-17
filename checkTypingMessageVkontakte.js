// CONFIG
//  dialog_name - Название диалога (учитывается только в headless mode) или пустота - "", если любой диалог
//  expected_user_name - Имя пользователя для поиска (учтите, что в ЛС пишется только Имя, без Фамилии) или пустота - "", если любой пользователь
//  melody_url - Ссылка на мелодию (https://mp3melodii.ru/files_site_02/001/boj_kurantov.mp3)

// SETTINGS
//  mode - Режим работы: headless - в списке диалогов, default - непосредственно в самом диалоге
//  play_melody - Воспроизводить мелодию или нет
//  interaval_cheking - Интервал проверки
//  interval_delay_after_checked - Интервал после отправки уведомления

// CONFIG
//  dialog_name - Название диалога (учитывается только в headless mode) или пустота - "", если любой диалог
//  expected_user_name - Имя пользователя для поиска (учтите, что в ЛС пишется только Имя, без Фамилии) или пустота - "", если любой пользователь
//  melody_url - Ссылка на мелодию (https://mp3melodii.ru/files_site_02/001/boj_kurantov.mp3)

// SETTINGS
//  mode - Режим работы: headless - в списке диалогов, default - непосредственно в самом диалоге
//  play_melody - Воспроизводить мелодию или нет
//  interaval_cheking - Интервал проверки
//  interval_delay_after_checked - Интервал после отправки уведомления


var interval_id;
var notification;
var audio;

const CONFIG = {
    dialog_name: "",
    expected_user_name: "",
    melody_url: "https://mp3melodii.ru/files_site_02/001/boj_kurantov.mp3"
}

const SETTINGS = {
    mode: "headless",
    play_melody: false,
    interaval_cheking: 2000,
    interval_delay_after_checked: 20000
}

// Проверка печатания
function checkTyping() {
    let selector;
    let send_notice = false;

    // Если включен режим "headless"
    if (SETTINGS.mode == "headless") {
        let dialog_array = document.querySelectorAll(".nim-dialog");

        dialog_array.forEach((dialog) => {
            let dialog_name = getTextElementBySelector(dialog, "._im_dialog_link");
            let typing_name = getTextElementBySelector(dialog, ".nim-dialog--typing");

            // Если нашли диалог по названию
            if (occurrenceCheck(dialog_name, CONFIG.dialog_name) || CONFIG.dialog_name.trim() == "") {
                if (checkDataDialog(dialog_name, typing_name)) {
                    send_notice = true;
                }
            }
        })
    }
    // Иначе если включен режим "default"
    else if (SETTINGS.mode == "default") {
        let dialog_name = getTextElementBySelector(document, ".im-page--title-main-inner");
        let typing_name = getTextElementBySelector(document, "._im_typing_name");
        if (checkDataDialog(dialog_name, typing_name)) {
            send_notice = true;
        }
    }

    clearInterval(interval_id);

    if (send_notice === true) {
        interval_id = setInterval(checkTyping, SETTINGS.interval_delay_after_checked);
    } else {
        interval_id = setInterval(checkTyping, SETTINGS.interaval_cheking);
    }

    return false;
}

// Проверить диалог
function checkDataDialog(dialog_name, typing_name) {
    let send_notice = false;
    let typing_name_split = typing_name.split(' ');
    let user_name = typing_name_split[0]

    if (user_name == "печатает") {
        user_name = dialog_name;
    } else {
        user_name = typing_name_split[0] + " " + typing_name_split[1];
    }

    user_name = user_name.trim();

    if (CONFIG.expected_user_name.trim() == "") {
        if (typing_name != "") {
            send_notice = true;
        }
    } else if (occurrenceCheck(user_name, CONFIG.expected_user_name)) {
        send_notice = true;
    }

    if (send_notice === true) {
        sendNoticeAndLogging(dialog_name, user_name);
    }

    return send_notice;
}

// Отправить уведомление и сделать логгирование
function sendNoticeAndLogging(dialog_name, user_name) {
    let notification_message = "Пользователь " + user_name + " пишет в диалоге " + dialog_name;
    console.log(notification_message);
    sendNotification(notification_message);
}

// Проверка вхождения подстроки в строку
function occurrenceCheck(text, word) {
    return typeof text === 'string' && typeof word === 'string' && text.includes(word);
}

// Получить текст элемента по селектору
function getTextElementBySelector(finding_element, selector) {
    let element = finding_element.querySelector(selector);
    if (element !== null) {
        return element.innerText;
    }
}

// Отправить уведомление
function sendNotification(notification_message) {

    // Проверяем поддержку уведомлений в браузере
    if (!("Notification" in window)) {
        alert("Этот браузер не поддерживает уведомления");
        return;
    }

    // Запрашиваем разрешение на отправку уведомлений
    Notification.requestPermission().then(function (permission) {
        // Если пользователь разрешил отправку уведомлений
        if (permission === "granted") {
            notification = new Notification(notification_message);

            if (SETTINGS.play_melody === true) {
                // Проверяем, поддерживает ли браузер воспроизведение аудио
                if ('HTMLAudioElement' in window) {
                    audio.play();
                } else {
                    console.log("Браузер не поддерживает воспроизведение аудио");
                }
            }
        }
    });
}

function start() {
    audio = new Audio(CONFIG.melody_url);

    // Автоматически проверять диалог (каждые 5 секунд)
    interval_id = setInterval(checkTyping, SETTINGS.interaval_cheking);
}

start();
