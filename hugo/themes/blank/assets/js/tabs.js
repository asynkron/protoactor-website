let tabId = 0;
let selected="C#";
let inClick = false;
$(document).ready(function () {

    $('.tab-content').each(function (inx2, tabContent) {
        $(this).find('.tab-pane').each(function (idx, item) {

            var navTabs = $(this).closest('.code-tabs').find('.nav-tabs');
            let title = $(this).attr('title');
            let id = 'tab' + tabId;
            $(this).attr("id", "tab" + tabId);

            let a = $('<a class="nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#' + id + '" aria-controls="' + id + '" >' + title + '</a>');
            let li = $('<li class="nav-item"></li>');
            a.appendTo(li);
            li.appendTo(navTabs);
            a.click(() => {
                if (inClick){
                    return;
                }
                inClick = true;
                let allTabLinks = $('.code-tabs').find("ul li a");
                let allTabLinksOfSameText = allTabLinks.filter(function(index) { return $(this).text() === title && $(this).attr('href') != "#" + id })
                allTabLinksOfSameText.click();
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
    })
});