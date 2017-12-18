# Install

### Install the NodeJS repo
```
curl --silent --location https://rpm.nodesource.com/setup_8.x | sudo bash -
```

### NodeJS to get Node and NPM
```
sudo yum install nodejs
```

### Optional dependencies that might be needed for build tools
```
sudo yum install gcc-c++ make
```

### Optional install Yarn as a replacement for NPM
```
sudo npm install -g yarn
```

### Angular CLI to be able to build the Client
* NPM:
```
sudo npm install -g @angular/cli
```
* Yarn:
```
sudo yarn global add @angular/cli
```

### PM2 to run NodeJS applications
* NPM:
```
sudo npm install -g pm2
```
* Yarn:
```
sudo yarn global add pm2
```

### Apache to host the Client
```
sudo yum install httpd
```

### Setup the Firewall to allow HTTP
```
sudo firewall-cmd --permanent --add-port=80/tcp
```

### Restart the Firewall
```
sudo firewall-cmd --reload
```

### Start Apache
```
sudo systemctl start httpd
```

### Enable Apache to start on boot
```
sudo systemctl enable httpd
```

### Create a new folder structure for Apache to serve HTML from
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
```
sudo mkdir -p /var/www/YOURDOMAIN/public_html
```

### Change permission of the folder to the current user
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
```
sudo chown -R $USER:$USER /var/www/YOURDOMAIN/public_html
```

### Set appropriate permissions
```
sudo chmod -R 755 /var/www
```

### Create the barebone index.html file to test the Apache Server
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
##### You may use your preferred editor
##### Vim is used here
```
vim /var/www/YOURDOMAIN/public_html/index.html
```

### Example html
```html
<!DOCTYPE html>
<html>
	<head>
		<title>DeCP Live</title>
	</head>
	<body>
		<h1>Apache is running correctly!</h1>
	</body>
</html>
```

### Create the Apache Virtual Host files
```
sudo mkdir /etc/httpd/sites-available
sudo mkdir /etc/httpd/sites-enabled
```

### Edit to Apache config to include "sites-enabled"
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
##### You may use your preferred editor
##### Vim is used here
```
sudo vim /etc/httpd/sites-available/YOURDOMAIN.conf
```

### Append this line to the file at the very bottom
```
IncludeOptional sites-enabled/*.conf
```

### Create the Virtual Host file
##### An example config file will be supplied with the project under /apache/decplive.net.conf
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
##### You may use your preferred editor
##### Vim is used here
```
sudo vim /etc/httpd/sites-available/YOURDOMAIN.conf
```

### Enable the site
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
```
sudo ln -s /etc/httpd/sites-available/YOURDOMAIN.conf /etc/httpd/sites-enabled/YOURDOMAIN.conf
```

### Restart Apache
```
sudo apachectl restart
```

### Optional configure the hosts file to be able to resolve the domain name locally
##### You may use your preferred editor
##### Vim is used here
```
sudo vim /etc/hosts
```

### Append this line to the file at the very bottom
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
```
127.0.0.1 YOURDOMAIN
````

### You should now be able to test that the website returns the expected html by running the following command
##### Replace YOURDOMAIN with your desired domain. E.g. decplive.net
```
curl YOURDOMAIN
```