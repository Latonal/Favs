# What's to expect next

Any bullet point to this section is expected to be worked on in a close future.

- A rework of the HTML
    - Currently heavily linked to the JS part, the goal will be to make the JS more independent of the HTML structure.
- A standardization of the CSS
    - The CSS is currently in a really poor state due to a rush to finally release a debut version of Favs, reworking the CSS to induce reusability will allow it to have more consistency.
- Deleting an icon
    - While you can add or edit an icon to your icon list, there is currently no way to delete one, so it'll be implemented soon.
- Adding SVGs as icons
    - A bit of a harder implementation on its current state: the app don't allow use of plain SVGs as link, but a reference to an SVG file do work. SVG is a more optimised way to use icons, and so having to avoid one step to use your SVGs (meaning, having to save on a file) will be important to save your time.
- An update window & rework of popups
    - So you can more easily see what has been added. Also, there is already a popup system, but it's quite bad. The "news" window will work on the new popup system.

# What's to expect later

Any bullet point to this section is expected to be part of Favs but with no priority on any of them.

- A big rework of the current JS structure on many levels
    - Favs is heavily reliant on JS. Many of the JS files *should be* dedicated to one specific part of Favs and have their own structure according to what's required of it, but sacrifices have been made to release the debut version of Favs: readability, reuse, structure of the code... The rework will come slowly during development as it impact many parts of it.
- Other types of Sticker/Collection
    - Currently, only two types (list and icon) have been implemented, mostly to understand how the code will work behind it to make it easy to add more of them, but other are expected to be added on the app, including image gallery, videos, calendar, todo list...
- Right clicking and Right dragging
    - While editing, you might be tempted to add or delete a Sticker/Collection. Having to click on said button can be quite annoying, so a right click will be added to have a quicker access to those functionality and some others.
    - Right dragging will be a key to editing your Playground. Currently, whenever you create a Collection, they can either be below or above one. Being able to right drag a Collection will allow you to put on either side of a Collection (and right clicking to directly create a Collection in said position). You'll also be able to create Collection below or above a side Collection... and a Collection on the side of it... and below or above it... and so on.
- Rework of edit menus
    - While edit menus are currently working, it can be quite hard to know *which* Element we are changing. In the future, it'll be made clearer.
    - Along with right dragging for side elements, it'll be made easier to have access to a parent Collection or even a Page, by clicking on the child and then selecting the parent in a breadcrumb.
- Floating Elements
    - Currently, Stickers are either on the side of each other or above/below. In the future, being able to put any Sticker at any position to fit your own need will be added.
- Force loading
    - Imagine, you have a Collection with more than a hundred pictures in an image gallery and you are on a potato device: loading your own homepage might take some time, maybe less than a second, but enough to be annoying, especially if you don't intend to have use of said Collection anytime you load Favs. So, a new option to force an input from you (like when you click on a Tab to load a new Page) will be a solution that'll be implemented.
- Tips improvement
    - Tips is a small but useful part of the application, giving indications on new ways to use Favs if you don't read the "news" window. It is important to not be too visible to not become annoying, but visible enough so you will stumble on it.
- Better customization of the css
    - Currently, you can only make changes to a Sticker/Collection as a whole, meaning you can't update parts of it independently (like the text or the image). In the future, the aim would be to make it possible, and to also add presets (Themes) so you don't have to copy/paste your changes everywhere. Changes on Tabs/Pages will also be made available.
- Moving elements between Pages
    - Currently unavailable, but in the future, you'll be able to quickly move your Elements from one Page to another.
- Better customization of your own needs
    - While launching the app, you always stumble on the Tab(/Page) that is the most left-sided. On future updates, goal will be to make it so you can choose on which Page you'll be met with, if we should open the last one you went on, etc. While it might not be a lot, it is the kind of needs that'll be targeted to be answered to, and it'll constantly be evolving with Favs.
- Better accessibility support
    - Application of all sorts have the duty to be accessible to the most of the users possible. While accessibility is often shortened to adding "alt" to images, Favs will have a big work to do, notably on navigation, to allow people with all kind of disabilities to have access to it.
- Language support
    - While language support might not be an issue as long as you add *your* own changes, it is still an issue in the original implementation of the base playground, and on several texts you can have access on Favs.
- Errors and Tests
    - An important part of any application is to track down Errors. Currently, Errors messages do exist in the app but can be quite unclear even for me, mostly because I added Errors after implementing the functions. Making them easier to get for the users and clearer to understand for me will be of the upmost importance to make it more broadly available and create a better experience for you.
    - Being able to test the integrity of any app in a few commands is also a very important part of any application. Currently two base tests are available, but in the future every use case will have to be tested (making it more easy to solve independent issues).
- Mobile support
    - Mobile support has been voluntarily left over currently, but will be worked on. While mobile is more broadly used than desktops, some of the libraries and functions I started using had bad or no support for most of the mobile devices (although most of the code changed over time and I can't be so certain of it anymore). The point of Favs is currently to create your own homepage, which you can somewhat do on mobile, but will also be to easily share with other people, and so, mobile support will have to be a critical point of it.
- Import and Export
    - Being able to quickly share your data to another computer/browser or even to your friends is one of the critical points of Favs. It'll come with choosing wether sharing your whole Playground, or your own selection of Pages.
- A tutorial and a mascot
    - Currently, the tutorial is part of the initial generation of Favs. In the future, I'd like to add it as a really interactive tutorial with a mascot to lead it.


# What may be part of Favs

Any idea listed here is currently being studied on if it can be added to Favs. Do not have any expectation to see them being added to Favs as it is not dependent only of our capacity, like the implementation of the required standard library or function in modern browsers.

- Fetch data
    - Sharing with other people is a critical point of Favs. While the Import/Export is a first step, being able to access any "public" page will be the second. By that I mean, sharing a link to Favs but with a few more data in it, like a link to Google Drive, Github, a NAS... so other people can have a quick access without changing their own Playground.