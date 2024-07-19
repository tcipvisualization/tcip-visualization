export const upperFirstLetterOfWords = (str: string): string => {
    // including after slashes, then join with the split character
    const regex = /[\s/]/g;
    const splitStr = str.split(regex);
    const upperCased = splitStr.map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    });
    const splitChars = str.match(regex);
    if (!splitChars) {
        return upperCased.join(' ');
    }

    let result = '';
    for (let i = 0; i < upperCased.length; i++) {
        result += upperCased[i];
        if (i < splitChars.length) {
            result += splitChars[i];
        }
    }

    return result;
}

export const formatDollar = (num: number | undefined) => {
    if (!num) {
        return "Unknown";
    }

    // format without decimal places
    return Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(num);
}

export const fieldText = (value: string | undefined) => {
    return value ? upperFirstLetterOfWords(value) : "N/A or Unknown";
}

export const upperFirstLetterWithoutUnderscores = (str: string): string => {
    return str.split('_').map((word) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
}