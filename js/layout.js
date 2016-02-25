$(document).on('ready', function(){
  bindLinks()
  loadSearch()
})

$(window).on("popstate", function(e) {
  NProgress.start()
  $('title').html(e.originalEvent.state.title)
  $('#content').html(e.originalEvent.state.content)
  updateExternals()
  bindLinks()
  NProgress.done()
})

function bindLinks(){
  $("a[href^='/']").on('click', function(e){
    // Stop link from activating
    e.preventDefault()

    // Start the NProgress bar
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
      history.pushState({
        'title': $('title').html(),
        'content': $('#content').html()
      }, newTitle, url)

      updateExternals()

      // Make NProgress finish
      NProgress.done()

      // Re Bind to all the links on the page
      bindLinks()
    })
  })
}

function updateExternals(){
  // Update Google Analytics
  ga('set', 'location', window.location.href);
  ga('send', 'pageview');

  // Update disqus
  // If there is a disqus_thread on the page?
  if($('#disqus_thread').length !== 0){
    // Has Disqus been loaded before
    if ('undefined' !== typeof DISQUS){
      // Reset Disqus
      DISQUS.reset({
        reload: true,
        config: function () {
          this.page.identifier = disqus_identifier
          this.page.url = disqus_url
        }
      });
    }
  }
}

function loadSearch(){
  // Create a new Index
  idx = lunr(function(){
    this.field('id')
    this.field('title', { boost: 10 })
    this.field('summary')
  })

  // Send a request to get the content json file
  $.getJSON('/content.json', function(data){

    // Put the data into the window global so it can be used later
    window.searchData = data

    // Loop through each entry and add it to the index
    $.each(data, function(index, entry){
      idx.add($.extend({"id": index}, entry))
    })
  })

  // When search is pressed on the menu toggle the search box
  $('#search').on('click', function(e){
    e.preventDefault()
    $('.searchForm').toggleClass('show')
  })

  // When the search form is submitted
  $('#searchForm').on('submit', function(e){
    // Stop the default action
    e.preventDefault()

    // Find the results from lunr
    results = idx.search($('#searchField').val())

    // Empty #content and put a list in for the results
    $('#content').html('<h1>Search Results (' + results.length + ')</h1>')
    $('#content').append('<ul id="searchResults"></ul>')

    // Loop through results
    $.each(results, function(index, result){
      // Get the entry from the window global
      entry = window.searchData[result.ref]

      // Append the entry to the list.
      $('#searchResults').append('<li><a href="' + entry.url + '">' + entry.title + '</li>')
    })
  })
}
