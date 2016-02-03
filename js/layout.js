$(document).on('ready', function(){
  bindLinks()
})

function bindLinks(){
  $("a[href^='/']").on('click', function(e){
    // Stop link from activating
    e.preventDefault()
    NProgress.start()

    // Get the URL to load
    url = $(this).attr('href')

    // Send a Get request to the URL
    $.get(url, function(data){
      // Get the title of the new page
      regex = /<title>(.*)<\/title>/g
      newTitle = regex.exec(data)[1]

      // Set the title to the new title
      $('title').html(newTitle)

      // Replace the content
      $('#content').html($(data).find('#content').html())

      // Push a new state to the browser
      history.pushState({}, newTitle, url)

      // Update Google Analytics
      ga('set', 'location', window.location.href);
      ga('send', 'pageview');

      NProgress.done()

      // Re Bind to all the links on the page
      bindLinks()
    })
  })
}
