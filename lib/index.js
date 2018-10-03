/* global URL */
import * as Media from './media'

function setupDefaultValues (options) {
  return Object.assign({
    muted: false,
    timeout: 2500,
    inline: false
  }, options)
}

function startPlayback ({muted, timeout, inline}, elementCallback) {
  let {element, source} = elementCallback()
  let playResult
  let timeoutId
  let sendOutput
  let originalSource

  element.muted = muted
  if (muted === true) {
    element.setAttribute('muted', 'muted')
  }
  // indicates that the video is to be played "inline",
  // that is within the element's playback area.
  if (inline === true) {
    element.setAttribute('playsinline', 'playsinline')
  }

  originalSource = element.src
  element.src = source

  return new Promise(resolve => {
    playResult = element.play()
    timeoutId = setTimeout(() => {
      sendOutput(false, new Error(`Timeout ${timeout} ms has been reached`))
    }, timeout)
    sendOutput = (result, error = null) => {
      clearTimeout(timeoutId)
      resolve({result, error})
    }

    if (playResult !== undefined) {
      playResult
        .then(() => {
          element.src = originalSource
          sendOutput(true)
        })
        .catch(playError => {
          element.src = originalSource
          sendOutput(false, playError)
        })
    } else {
      element.src = originalSource
      sendOutput(true)
    }
  })
}

//
// API
//

function video (options) {
  options = setupDefaultValues(options)
  return startPlayback(options, () => {
    return {
      element: document.querySelector('video'),
      source: URL.createObjectURL(Media.VIDEO)
    }
  })
}

function audio (options) {
  options = setupDefaultValues(options)
  return startPlayback(options, () => {
    return {
      element: document.querySelector('audio'),
      source: URL.createObjectURL(Media.AUDIO)
    }
  })
}

export default {audio, video}
