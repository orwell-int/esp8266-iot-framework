from subprocess import call
import inspect, os.path


def preBuildHTMLFun():
    filename = inspect.getframeinfo(inspect.currentframe()).filename
    dir_path = os.path.dirname(os.path.abspath(filename))
    webpackInst = os.path.isdir(dir_path + "/../node_modules")

    if webpackInst == False:
        print("Running npm ci...")
        call("npm ci", shell=True)
        print("Running npx browserslist@latest --update-db...")
        call("npx browserslist@latest --update-db", shell=True)

    print("Running npm run build...")
    if call("npm run build", shell=True) != 0:
        raise("JAMBON failed")
