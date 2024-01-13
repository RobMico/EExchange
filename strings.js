"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Strings = void 0;
class Strings {
    constructor() {
        //$1 - валюта обмена(из какой)
        //$2 - валюта зачисления(в какую)
        //$3 - Сумма обмена(в валюте обмена)
        //$4 - Сумма зачисления(получаемая валюта)
        //$5 - обменный курс
        //$6 - счет пользователя
        //$7 - предоставленый счет
        //$8 - ник пользователя
        this.QuestionGreeting = `Здраствуйте, это бот обменник, выберете валюту которую вы хотите обменять`;
        this.QuestionSelectReceivedCurrency = `Выберете валюту получения`;
        this.QuestionTypeSum = `Курс составляет 1$1=$5$2\nВведите сумму обмена в валюте $1(вводить только цифры, не нужно указывать валюту)`;
        this.QuestionConfirm = `Вы получите $4 $1`;
        this.QuestionCancelChoose = `Обмен был отклонен, что бы начать сначала введите /start`;
        this.QuestionSelectBill = `Веедите ваш счет:`;
        this.QuestionAwaitBill = `Ожидайте получения счета`;
        this.QuestionConfirmChoose = `Будет произведен следующий обмен:
Вы выплачиваете $3 $1
На счет:$7
Вы получаете $4 $2
На счет $6
`;
        this.QuestionCheque = 'Отправьте пожалуйста чек в этот чат(Подходящие форматы - pdf или изображение)';
        this.QuestionFinishAwait = 'Ожидайте рассмотрения вашего платежа';
        this.QuestionFinishDone = 'Спасибо за использование нашего сервиса, для нового обмена нажмите /start';
        this.QuestionDeclined = 'Ваш обмен был отклонен';
        this.QuestionHelp = 'Перейдите в чат по кнопке ниже для получения помощи';
        this.ButtonRestart = 'Начать сначала';
        this.ButtonHelp = 'Помощь';
        this.ButtonHelpDirect = 'Помощь';
        this.ButtonTextPaid = 'Оплачено';
        this.ButtonTextConfirm = `Подтвердить`;
        this.ButtonTextCancel = `Отклонить`;
        this.ErrorNoBilling = `К сожалению мы сейчас не можем предаставить вам обмен с этой валютой, попробуйте позже`;
        this.ErrorInvalidCheque = `Отправлен чек неверный, попробуйте еще раз`;
        this.ErrorSameCurrency = `Валюта отправления и получения одинаковая, попробуйте еще раз`;
        this.ErrorFalseInput = `Для выбора жмите кнопки в меню, нет нужды писать что то сюда`;
        this.ErrorTimeout = `Время обмена истекло, если вы все еще хотите совершить обмен жмите /start`;
        this.ErrorSumInput = `Сумма была введена неверно, попытайтесь еще раз`;
        this.ErrorUnknown = `Что то пошло не так`;
        this.ChatResultMessage = `Username:$8
Course:1$1=$5$2
Input sum:$3 $1
Output sum:$4 $2
Client billing:$6
Provided billing:$7`;
        this.currencies = [
            `RUB`,
            `Bitcoin (BTC)`,
            `Tether (USDT)`,
            `Litecoin (LTC)`,
            `Ethereum (ETH)`,
            `Ripple (XRP)`,
            `Dogecoin (DOGE)`,
            `Solana (SOL)`,
            `Monero (XMR)`,
            `BowsCoin (BSC)`,
            `Travala (AVA)`,
            `Binance Coin (BNB)`,
            `USD Coin (USDC)`,
            `Cardano (ADA)`,
            `Terra (LUNA)`,
            `Avalanche (AVAX)`,
        ];
        this.CurrenciesToShort = {
            'RUB': 'RUB',
            'Bitcoin (BTC)': 'BTC',
            'Tether (USDT)': 'USDT',
            'Litecoin (LTC)': 'LTC',
            'Ethereum (ETH)': 'ETH',
            'Ripple (XRP)': 'XRP',
            'Dogecoin (DOGE)': 'DOGE',
            'Solana (SOL)': 'SOL',
            'Monero (XMR)': 'XMR',
            'BowsCoin (BSC)': 'BSC',
            'Travala (AVA)': 'AVA',
            'Binance Coin (BNB)': 'BNB',
            'USD Coin (USDC)': 'USDC',
            'Cardano (ADA)': 'ADA',
            'Terra (LUNA)': 'LUNA',
            'Avalanche (AVAX)': 'AVAX',
        };
        this.BotAdminHelp = `/chats показує активні канали бота
/toggle перемикач вкл/викл для бота
/billings показує введені рахунки бота
/help виводить це вікно`;
    }
}
exports.Strings = Strings;
