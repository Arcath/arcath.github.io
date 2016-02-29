function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

$(document).on('ready', function(){
  bindLinks()
  loadSearch()

  if(getParameterByName('category')){
    category = getParameterByName('category')
    showCategory(category)
  }
})

$(window).on("popstate", function(e) {
  // Start NProgress
  NProgress.start()

  // Set the Title and content
  $('title').html(e.originalEvent.state.title)
  $('#content').html(e.originalEvent.state.content)

  // Reload on-page apis
  updatePageAPIs()
  bindLinks()

  // Finish NProgress
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

      updatePageAPIs()

      // Make NProgress finish
      NProgress.done()

      // Re Bind to all the links on the page
      bindLinks()
    })
  })

  $('.category-list a').on('click', function(e){
    e.preventDefault()

    category = $(this).html()

    showCategory(category)
  })
}

function updatePageAPIs(){
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

function showCategory(category){
  NProgress.start()

  $.getJSON('/categories.json', function(data){
    posts = data[category]
    $('title').html(category)
    $('#content').html("<h1>" + category + "</h1><ul id=\"posts-list\"></ul>")

    $.each(posts, function(index, entry){
      $('#posts-list').append('<li><a href="' + entry.url + '">' + entry.title + '</a></li>')
    })

    history.pushState({
      'title': $('title').html(),
      'content': $('#content').html()
    }, category, "/category.html?category=" + category)

    bindLinks()
    NProgress.done()
  })
}

function loadSearch(){
  // Create a new Index
  idx = lunr(function(){
    this.field('id')
    this.field('title', { boost: 10 })
    this.field('summary')
  })

  // If search parameter exists
  if(getParameterByName('search')){
    query = getParameterByName('search')

    $('.searchForm').toggleClass('show')
    $('#searchField').val(query)
    $('#content').html('')
    $('title').html('Loading...')
  }

  // Send a request to get the content json file
  $.getJSON('/content.json', function(data){

    // Put the data into the window global so it can be used later
    window.searchData = data

    // Loop through each entry and add it to the index
    $.each(data, function(index, entry){
      idx.add($.extend({"id": index}, entry))
    })

    if(getParameterByName('search')){
      handleSearch()
    }
  })

  // When search is pressed on the menu toggle the search box
  $('#search').on('click', function(e){
    e.preventDefault()
    $('.searchForm').toggleClass('show')
  })

  // When the search form is submitted
  $('#searchForm').on('submit', handleSearch)
}

function handleSearch(e){
  NProgress.start()

  // Stop the default action
  if(e){
    e.preventDefault()
  }

  // Find the results from lunr
  results = idx.search($('#searchField').val())

  // Empty #content and put a list in for the results
  $('#content').html('<h1>Search Results (' + results.length + ')</h1>')
  $('#content').append('<ul id="searchResults"></ul>')
  $('title').html("Search Results")

  // Push a state to the browser so you can back to this page.
  if(e){
    history.pushState({
      'title': $('title').html(),
      'content': $('#content').html()
    }, "Search Results", window.location + "?search=" + $('#searchField').val())
  }

  // Loop through results
  $.each(results, function(index, result){
    // Get the entry from the window global
    entry = window.searchData[result.ref]

    // Append the entry to the list.
    $('#searchResults').append('<li><a href="' + entry.url + '">' + entry.title + '</li>')
  })

  // Bind the links to make them ajaxy
  bindLinks()

  NProgress.done()
}
