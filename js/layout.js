function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function updatePage(title, content, url){
  // Set the title to the new title
  $('title').html(title)

  // Replace the content
  $('#content').html(content)

  // Push a new state to the browser
  history.pushState({
    'title': $('title').html(),
    'content': $('#content').html()
  }, title, url)

  bindLinks()
  updatePageAPIs()
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

    pattern = /\/category\.html\?category=(.*)/
    if(pattern.test(url)){
      matches = pattern.exec(url)
      showCategory(matches[1])
      NProgress.done()
    }else{
      // Send a Get request to the URL
      $.get(url, function(data){
        // Get the title of the new page
        regex = /<title>(.*)<\/title>/g
        newTitle = regex.exec(data)[1]

        content = $(data).find('#content').html()

        updatePage(newTitle, content, url)

        // Make NProgress finish
        NProgress.done()
      })
    }
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

function decodeEntities(encodedString) {
    var textArea = document.createElement('textarea');
    textArea.innerHTML = encodedString;
    return textArea.value;
}

function showCategory(category){
  NProgress.start()

  $.getJSON('/categories.json', function(data){
    posts = data[category]
    $('#content').html("<h1>" + category + "</h1>")

    $.each(posts, function(index, entry){
      $('#content').append(decodeEntities(entry.html))
    })

    updatePage(category, $('#content').html(), "/category.html?category=" + category)

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
  $('#searchPageForm').on('submit', handleSearch)
}

function handleSearch(e){
  NProgress.start()

  // Stop the default action
  if(e){
    e.preventDefault()
  }

  // Find the results from lunr
  query = ($('#searchField').val() || $('#searchPageField').val())
  results = idx.search(query)

  // Empty #content and put a list in for the results
  $('#content').html('<h1>Search Results (' + results.length + ')</h1>')
  $('title').html("Search Results")

  // Push a state to the browser so you can back to this page.
  if(e){
    history.pushState({
      'title': $('title').html(),
      'content': $('#content').html()
    }, "Search Results", "/search.html?search=" + query)
  }

  // Loop through results
  $.each(results, function(index, result){
    // Get the entry from the window global
    entry = window.searchData[result.ref]

    // Append the entry to the list.
    $('#content').append(decodeEntities(entry.html))
  })

  // Bind the links to make them ajaxy
  bindLinks()

  NProgress.done()
}
