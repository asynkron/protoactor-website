let tabId = 0;
let selected="C#";

$(document).ready(function () {

    $('.tab-content').each(function (inx2, tabContent) {
        $(this).find('.tab-pane').each(function (idx, item) {

            var navTabs = $(this).closest('.code-tabs').find('.nav-tabs');
            title = $(this).attr('title');
            $(this).attr("id", "tab" + tabId);

            let a = $('<a class="nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#tab' + tabId + '" aria-controls="tab' + tabId + '" >' + title + '</a>');
            let li = $('<li class="nav-item"></li>');
            a.appendTo(li);
            li.appendTo(navTabs);


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