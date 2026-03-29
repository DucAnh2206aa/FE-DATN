const HTML_TAG_PATTERN = /<\/?[a-z][\s\S]*>/i

export const hasRichTextMarkup = (value: string) => {
  return HTML_TAG_PATTERN.test(value)
}

const stripHtmlToPlainText = (value: string) => {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const normalizeRichTextValue = (value?: string) => {
<<<<<<< HEAD
  const normalized = value?.trim()

  if (!normalized) {
    return undefined
  }

  if (!stripHtmlToPlainText(normalized)) {
    return undefined
  }

  return normalized
}
=======
    const normalized = value?.trim()

    if (!normalized) {
        return undefined
    }

    if (!stripHtmlToPlainText(normalized)) {
        return undefined
    }

    return normalized
}
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
