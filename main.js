var s3base = 'http://streetviewvids.s3.amazonaws.com';
// s3base = '';

var handlers = {
  'congress': {
    file: 'property_animated.csv',
    title: 'Real Estate Assets Owned by Members of the U.S. Congress',
    handler: function(data){
      data.forEach(function(d){
        addVideo(s3base + '/congress_animation/' + d.pfid + '.mp4');
      });

      var overlay = d3.select('#overlay');

      d3.selectAll('.video').data(data).on('mouseover', function(d){
        overlay.select('#name').text(clean_name(d.name));
        overlay.select('#address').text(d.descrip);
        overlay.select('#value').text('Reported value: ' + display_value(d.min_value, d.max_value));
        var o_height = $('#overlay').height();
        var offset = $(this).offset();
        var height = $(this).height();
        overlay.style({left: offset.left, top: offset.top+height-o_height, display: 'block'});
      // }).on('mouseout', function(){
      //   overlay.style({display: 'none'});
      });
    }
  },
  'college': {
    file: 'colleges.csv?v=2',
    title: 'For-Profit Universities in the U.S.',
    handler: function(data){
      data.forEach(function(d){
        addVideo(s3base + '/college_animation/' + d.id + '.mp4');
      });

      var overlay = d3.select('#overlay');

      d3.selectAll('.video').data(data).on('mouseover', function(d){
        overlay.select('#name').text(d.name);
        overlay.select('#address').text(d.address);
        overlay.select('#value').text('');
        var o_height = $('#overlay').height();
        var offset = $(this).offset();
        var height = $(this).height();
        overlay.style({left: offset.left, top: offset.top+height-o_height, display: 'block'});
      }).on('mouseout', function(){
        overlay.style({display: 'none'});
      });
    }
  },
  'prison': {
    file: 'private_filtered.csv?v=3',
    title: 'Privately Owned Prisons in the U.S.',
    handler: function(data){
      data.forEach(function(d){
        addVideo(s3base + '/prison_animation/' + d.serialid + '.mp4');
      });

      var overlay = d3.select('#overlay');

      d3.selectAll('.video').data(data).on('mouseover', function(d){
        overlay.select('#name').text(d.facility_name);
        overlay.select('#address').text('Owned by: ' + d.owner_if_private);
        overlay.select('#value').text(d.facility_address1 + ', ' + d.city + ', ' + d.state);
        var o_height = $('#overlay').height();
        var offset = $(this).offset();
        var height = $(this).height();
        overlay.style({left: offset.left, top: offset.top+height-o_height, display: 'block'});
      }).on('mouseout', function(){
        overlay.style({display: 'none'});
      });
    }
  },
  'bank': {
    file: 'banks_with_addresses.csv',
    title: '100 Biggest Banks in the World',
    handler: function(data){
      data.forEach(function(d){
        addVideo(s3base + '/bank_animations/' + d.rank + '.mp4');
      });

      var overlay = d3.select('#overlay');

      d3.selectAll('.video').data(data).on('mouseover', function(d){
        overlay.select('#name').text(d.name);
        overlay.select('#address').text(d.country);
        overlay.select('#value').text('Total assets (USD Billions): ' + d.total_assets_bn );
        var o_height = $('#overlay').height();
        var offset = $(this).offset();
        var height = $(this).height();
        overlay.style({left: offset.left, top: offset.top+height-o_height, display: 'block'});
      }).on('mouseout', function(){
        overlay.style({display: 'none'});
      });
    }
  }
};


function addVideo(src) {
  var container = $('<div>').addClass('video').appendTo('#videos');
  var inner = $('<div>').addClass('inner').appendTo(container);
  // var width = container.width();
  var video = $('<video>');
  video.data('src', src);
  video.data('started', false);
  video.data('playing', false);
  video.attr('loop', 'loop');
  // video.attr('height', width);
  video.appendTo(inner);
  video.bind('inview', function viewHandler(event, isInView, visiblePartX, visiblePartY) {
    if (isInView) {
      if ($(this).data('started') === false) {
        $(this).data('started', true);
        this.src = $(this).data('src');
      }
      if ($(this).data('playing') !== true) {
        $(this).data('playing', true);
        // $(this).attr('height', 'auto');
        this.play();
      }
    } else {
      if ($(this).data('playing') === true) {
        $(this).data('playing', false);
        this.pause();
      }
    }
  });
}

function reverse(video){
  video.currentTime -= 0.01;
  if (video.currentTime <= 0) {
    video.play();
  } else {
    setInterval(reverse, 100, video);
  }
}

function looper(video, inc) {
  if (video.duration) {
    var t = video.currentTime + inc;
    if (t < 0) t = 0;
    if (t > video.duration) t = video.duration;
    video.currentTime = t; 
    if (t >= video.duration) {
      inc = Math.abs(inc) * -1;
    } 
    if (video.currentTime === 0)  {
      inc = Math.abs(inc);
    }
  }
  setTimeout(looper, 100, video, inc);
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function display_value(minv, maxv){
  if (!minv || !maxv) {
    return 'unknown';
  }
  minv = +minv;
  maxv = +maxv;
  if (minv === maxv){
    if (minv === 0) {
      return '$0.0';
    } else {
      return 'Over $' + numberWithCommas(minv-1);
    }
  } else {
    if (minv > 0) minv--;
    return '$' + numberWithCommas(minv) + ' to $' + numberWithCommas(maxv);
  }
}

function clean_name(name) {
  var parts = name.split(', ');
  return parts[1] + ' ' + parts[0];
}

function load_data(handler) {
  $('#videos').html('');
  $('#overlay').hide();
  // $('header h1').text(handler.title);
  d3.csv(handler.file, handler.handler);
}

var hash = window.location.hash;
var s = hash.replace('#', '');
if (hash && handlers[s]) {
  load_data(handlers[s]);
  $('#set').val(s);
} else {
  load_data(handlers[$('#set').val()]);
}


$('#set').on('change', function(){
  var handler = handlers[$(this).val()];
  window.location.hash = '#' + $(this).val();
  load_data(handler);
});
