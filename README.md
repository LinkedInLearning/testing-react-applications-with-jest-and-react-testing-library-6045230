# Testing React Applications with Jest and React Testing Library
This is the repository for the LinkedIn Learning course `Testing React Applications with Jest and React Testing Library`. The full course is available from [LinkedIn Learning][lil-course-url].

![course-name-alt-text][lil-thumbnail-url] 

## Course Description

<p>This course is designed for advanced React developers who want to master testing practices using React Testing Library. Join instructor Oluchukwu Okpala as she demonstrates how to write effective unit and integration tests, simulate user interactions, mock APIs, and successfully apply test-driven development (TDD) principles. By the end of this course, you’ll be prepared to ensure your React applications are robust, scalable, and maintainable through comprehensive testing techniques and best practices.</p><p>This course is integrated with GitHub Codespaces, an instant cloud developer environment that offers all the functionality of your favorite IDE without the need for any local machine setup. With GitHub Codespaces, you can get hands-on practice from any machine, at any time, all while using a tool that you’ll likely encounter in the workplace. Check out “Using GitHub Codespaces" with this course to learn how to get started.</p>

_See the readme file in the main branch for updated instructions and information._
## Instructions
This repository has branches for each of the videos in the course. You can use the branch pop up menu in github to switch to a specific branch and take a look at the course at that stage, or you can add `/tree/BRANCH_NAME` to the URL to go to the branch you want to access.

## Branches
The branches are structured to correspond to the videos in the course. The naming convention is `CHAPTER#_MOVIE#`. As an example, the branch named `02_03` corresponds to the second chapter and the third video in that chapter. 
Some branches will have a beginning and an end state. These are marked with the letters `b` for "beginning" and `e` for "end". The `b` branch contains the code as it is at the beginning of the movie. The `e` branch contains the code as it is at the end of the movie. The `main` branch holds the final state of the code when in the course.

When switching from one exercise files branch to the next after making changes to the files, you may get a message like this:

    error: Your local changes to the following files would be overwritten by checkout:        [files]
    Please commit your changes or stash them before you switch branches.
    Aborting

To resolve this issue:
	
    Add changes to git using this command: git add .
	Commit changes using this command: git commit -m "some message"


## Start the development server:
npm run dev

## Run all tests:
npm test

## Run tests with coverage:
npm run test-coverage

## Commiting changes
git add .
git commit -m "BRANCH#_VIDEO#"
git checkout BRANCH#_VIDEO#

## Viewing All Branches in Folders
git fetch --all

for branch in $(git branch -r | grep -v '\->' | sed 's/origin\///'); do
  git worktree add $branch $branch
done

## Instructor

Oluchukwu Okpala

Software Engineer

[0]: # (Replace these placeholder URLs with actual course URLs)

[lil-course-url]: https://www.linkedin.com/learning/testing-react-applications-with-jest-and-react-testing-library
[lil-thumbnail-url]: https://media.licdn.com/dms/image/v2/D560DAQHQsTjEe9r2wQ/learning-public-crop_675_1200/B56ZhSEsP5H0AY-/0/1753723619112?e=2147483647&v=beta&t=rHAPD4UaACGdo37VOX43Lg4MJ0XqN0GVfA-kyCk1PS4

