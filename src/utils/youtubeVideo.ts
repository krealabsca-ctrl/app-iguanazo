export function extractYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const m = url.match(/[?&]v=([\w-]{11})|youtu\.be\/([\w-]{11})|\/embed\/([\w-]{11})|\/shorts\/([\w-]{11})/);
  if (!m) return null;
  return m[1] || m[2] || m[3] || m[4] || null;
}

interface PlayerOptions {
  controls?: 0 | 1;
  mute?: 0 | 1;
  autoplay?: 0 | 1;
}

export function buildYoutubePlayerHTML(videoId: string, opts: PlayerOptions = {}): string {
  const controls = opts.controls ?? 0;
  const mute = opts.mute ?? 0;
  const autoplay = opts.autoplay ?? 1;
  return `<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<style>
  html,body{margin:0;padding:0;background:#000;height:100%;width:100%;overflow:hidden;}
  #player,iframe{width:100%;height:100%;border:0;display:block;}
</style>
</head><body>
<div id="player"></div>
<script>
  var player;
  var iv;
  var ready = false;
  function send(msg){
    try {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(msg));
      }
    } catch (_) {}
  }
  var tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  document.head.appendChild(tag);
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
      videoId: '${videoId}',
      host: 'https://www.youtube-nocookie.com',
      playerVars: {
        playsinline: 1,
        rel: 0,
        autoplay: ${autoplay},
        mute: ${mute},
        controls: ${controls},
        modestbranding: 1,
        fs: ${controls},
        iv_load_policy: 3,
        disablekb: 1,
        enablejsapi: 1,
        origin: 'https://www.youtube-nocookie.com',
        widget_referrer: 'https://www.laiguana.tv'
      },
      events: {
        onReady: function(e){
          ready = true;
          send({type:'ready', d: e.target.getDuration()});
          iv = setInterval(function(){
            try {
              if (ready && player.getCurrentTime) {
                send({type:'tick', t: player.getCurrentTime(), d: player.getDuration(), s: player.getPlayerState()});
              }
            } catch(_) {}
          }, 500);
        },
        onStateChange: function(e){ send({type:'state', s: e.data}); },
        onError: function(e){ send({type:'error', code: e.data}); }
      }
    });
  }
  window.__yt = {
    play: function(){ try{ player.playVideo(); }catch(_){} },
    pause: function(){ try{ player.pauseVideo(); }catch(_){} },
    seek: function(t){ try{ player.seekTo(t, true); }catch(_){} },
    rate: function(r){ try{ player.setPlaybackRate(r); }catch(_){} }
  };
</script>
</body></html>`;
}
