let tabId = 0;



$(document).ready(function () {

    //loop over each pane in the source
    $('.tab-content .tab-pane').each(function (idx, item) {

        //get the nav tabs UL 
        var navTabs = $(this).closest('.code-tabs').find('.nav-tabs');
        //get title from pane
        let title = $(this).attr('title');
        let id = 'tab' + tabId;
        $(this).attr("id", id);

        let li = $('<li class="nav-item"></li>').appendTo(navTabs);
        let a = $('<a class="nav-link" data-toggle="tab" role="tab" aria-selected="false" href="#' + id + '" aria-controls="' + id + '" >' + title + '</a>').appendTo(li);

        a.click(() => select(title));

        tabId++;
    });

    let tab = localStorage.getItem('tab') || "C#";

    select(tab);
});

function select(selected) {
    localStorage.setItem('tab', selected);

    $('.code-tabs').each(function () {
        $(this).find("a").each(function () {
            let a = $(this);
            let linkText = a.text();
            let isSelected = linkText === selected;
            a.toggleClass("active", isSelected);
            a.attr("aria-selected", isSelected);
        });
        $(this).find(".tab-pane").each(function () {
            let tab = $(this);
            let tabText = tab.attr("title");
            let isSelected = tabText === selected;
            tab.toggleClass("active", isSelected);
        });
    });
}