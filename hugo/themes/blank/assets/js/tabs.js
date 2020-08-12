let tabId = 0;
let selected="C#";
let inClick = false;
$(document).ready(function () {

    $('.tab-content .tab-pane').each(function (idx, item) {

            var navTabs = $(this).closest('.code-tabs').find('.nav-tabs');
            let title = $(this).attr('title');
            let id = 'tab' + tabId;
            $(this).attr("id", "tab" + tabId);

            let li = $('<li class="nav-item"></li>').appendTo(navTabs);
            let a = $('<a class="nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#' + id + '" aria-controls="' + id + '" >' + title + '</a>').appendTo(li);            
           
            a.click(() => {
                if (inClick){
                    return;
                }
                inClick = true;
                let allTabLinks = $('.code-tabs').find("ul li a");
                let allTabLinksOfSameTextExceptThis = allTabLinks.filter(function(index) { return $(this).text() === title && $(this).attr('href') != "#" + id })
                allTabLinksOfSameTextExceptThis.click(); //this causes recursion on the click event
                //I hack this using the inClick flag
                inClick = false;
            });


            if (selected == title) { //first tab. activate it
                $(this).addClass("active");                
                a
                .addClass("active")
                .attr("aria-selected","true");
            }
            
            tabId++;
        });
    });