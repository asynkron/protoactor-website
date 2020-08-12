let tabId = 0;
let selected = "C#";
let inClick = false;
$(document).ready(function () {

    $('.tab-content .tab-pane').each(function (idx, item) {

        var navTabs = $(this).closest('.code-tabs').find('.nav-tabs');
        let title = $(this).attr('title');
        let id = 'tab' + tabId;
        $(this).attr("id", "tab" + tabId);

        let li = $('<li class="nav-item"></li>').appendTo(navTabs);
        let a = $('<a class="nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#' + id + '" aria-controls="' + id + '" >' + title + '</a>').appendTo(li);

        a.click(() => select(title));

        tabId++;
    });

    select("C#");
});


function select(selected) {
    $('.code-tabs').each(function () {
        $(this).find("a").each(function () {
            let a =  $(this);
            let linkText = a.text();    
            let isSelected = linkText === selected;
            a.toggleClass("active",isSelected);
            a.attr("aria-selected", isSelected);
        });
        $(this).find(".tab-pane").each(function () {
            let tab =  $(this);
            let tabText = tab.attr("title");    
            let isSelected = tabText === selected;
            tab.toggleClass("active",isSelected);
        });
    });
}

