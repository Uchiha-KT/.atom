(function() {
  module.exports = function() {
    return atom.contextMenu.add({
      '.tree-view.full-menu .file, .tree-view.full-menu .directory': [
        {
          type: 'separator'
        }, {
          'label': 'Git',
          'submenu': [
            {
              label: 'Git add',
              'command': 'git-plus-context:add'
            }, {
              label: 'Git add + commit',
              'command': 'git-plus-context:add-and-commit'
            }, {
              label: 'Git checkout',
              'command': 'git-plus-context:checkout-file'
            }, {
              label: 'Git diff',
              'command': 'git-plus-context:diff'
            }, {
              label: 'Git difftool',
              'command': 'git-plus-context:difftool'
            }, {
              label: 'Git pull',
              'command': 'git-plus-context:pull'
            }, {
              label: 'Git push',
              'command': 'git-plus-context:push'
            }, {
              label: 'Git push --set-upstream',
              'command': 'git-plus-context:push-set-upstream'
            }, {
              label: 'Git unstage',
              'command': 'git-plus-context:unstage-file'
            }
          ]
        }, {
          type: 'separator'
        }
      ],
      'atom-text-editor:not(.mini)': [
        {
          'label': 'Git add file',
          'command': 'git-plus:add'
        }
      ]
    });
  };

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiZmlsZTovLy9DOi9Vc2Vycy91Y2hpaGEvLmF0b20vcGFja2FnZXMvZ2l0LXBsdXMvbGliL2NvbnRleHQtbWVudS5jb2ZmZWUiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7RUFBQSxNQUFNLENBQUMsT0FBUCxHQUFpQixTQUFBO1dBQ2YsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFqQixDQUFxQjtNQUNuQiw2REFBQSxFQUErRDtRQUM3RDtVQUFFLElBQUEsRUFBTSxXQUFSO1NBRDZELEVBRTdEO1VBQUEsT0FBQSxFQUFTLEtBQVQ7VUFDQSxTQUFBLEVBQVc7WUFDVDtjQUNFLEtBQUEsRUFBTyxTQURUO2NBRUUsU0FBQSxFQUFXLHNCQUZiO2FBRFMsRUFLVDtjQUNFLEtBQUEsRUFBTyxrQkFEVDtjQUVFLFNBQUEsRUFBVyxpQ0FGYjthQUxTLEVBU1Q7Y0FDRSxLQUFBLEVBQU8sY0FEVDtjQUVFLFNBQUEsRUFBVyxnQ0FGYjthQVRTLEVBYVQ7Y0FDRSxLQUFBLEVBQU8sVUFEVDtjQUVFLFNBQUEsRUFBVyx1QkFGYjthQWJTLEVBaUJUO2NBQ0UsS0FBQSxFQUFPLGNBRFQ7Y0FFRSxTQUFBLEVBQVcsMkJBRmI7YUFqQlMsRUFxQlQ7Y0FDRSxLQUFBLEVBQU8sVUFEVDtjQUVFLFNBQUEsRUFBVyx1QkFGYjthQXJCUyxFQXlCVDtjQUNFLEtBQUEsRUFBTyxVQURUO2NBRUUsU0FBQSxFQUFXLHVCQUZiO2FBekJTLEVBNkJUO2NBQ0UsS0FBQSxFQUFPLHlCQURUO2NBRUUsU0FBQSxFQUFXLG9DQUZiO2FBN0JTLEVBaUNUO2NBQ0UsS0FBQSxFQUFPLGFBRFQ7Y0FFRSxTQUFBLEVBQVcsK0JBRmI7YUFqQ1M7V0FEWDtTQUY2RCxFQXlDN0Q7VUFBRSxJQUFBLEVBQU0sV0FBUjtTQXpDNkQ7T0FENUM7TUE0Q25CLDZCQUFBLEVBQStCO1FBQzdCO1VBQ0UsT0FBQSxFQUFTLGNBRFg7VUFFRSxTQUFBLEVBQVcsY0FGYjtTQUQ2QjtPQTVDWjtLQUFyQjtFQURlO0FBQWpCIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSAtPlxuICBhdG9tLmNvbnRleHRNZW51LmFkZCB7XG4gICAgJy50cmVlLXZpZXcuZnVsbC1tZW51IC5maWxlLCAudHJlZS12aWV3LmZ1bGwtbWVudSAuZGlyZWN0b3J5JzogW1xuICAgICAgeyB0eXBlOiAnc2VwYXJhdG9yJ30sXG4gICAgICAnbGFiZWwnOiAnR2l0JyxcbiAgICAgICdzdWJtZW51JzogW1xuICAgICAgICB7XG4gICAgICAgICAgbGFiZWw6ICdHaXQgYWRkJyxcbiAgICAgICAgICAnY29tbWFuZCc6ICdnaXQtcGx1cy1jb250ZXh0OmFkZCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR2l0IGFkZCArIGNvbW1pdCcsXG4gICAgICAgICAgJ2NvbW1hbmQnOiAnZ2l0LXBsdXMtY29udGV4dDphZGQtYW5kLWNvbW1pdCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR2l0IGNoZWNrb3V0JyxcbiAgICAgICAgICAnY29tbWFuZCc6ICdnaXQtcGx1cy1jb250ZXh0OmNoZWNrb3V0LWZpbGUnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0dpdCBkaWZmJyxcbiAgICAgICAgICAnY29tbWFuZCc6ICdnaXQtcGx1cy1jb250ZXh0OmRpZmYnXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0dpdCBkaWZmdG9vbCcsXG4gICAgICAgICAgJ2NvbW1hbmQnOiAnZ2l0LXBsdXMtY29udGV4dDpkaWZmdG9vbCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR2l0IHB1bGwnLFxuICAgICAgICAgICdjb21tYW5kJzogJ2dpdC1wbHVzLWNvbnRleHQ6cHVsbCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR2l0IHB1c2gnLFxuICAgICAgICAgICdjb21tYW5kJzogJ2dpdC1wbHVzLWNvbnRleHQ6cHVzaCdcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIGxhYmVsOiAnR2l0IHB1c2ggLS1zZXQtdXBzdHJlYW0nLFxuICAgICAgICAgICdjb21tYW5kJzogJ2dpdC1wbHVzLWNvbnRleHQ6cHVzaC1zZXQtdXBzdHJlYW0nXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBsYWJlbDogJ0dpdCB1bnN0YWdlJyxcbiAgICAgICAgICAnY29tbWFuZCc6ICdnaXQtcGx1cy1jb250ZXh0OnVuc3RhZ2UtZmlsZSdcbiAgICAgICAgfVxuICAgICAgXSxcbiAgICAgIHsgdHlwZTogJ3NlcGFyYXRvcid9XG4gICAgXSxcbiAgICAnYXRvbS10ZXh0LWVkaXRvcjpub3QoLm1pbmkpJzogW1xuICAgICAge1xuICAgICAgICAnbGFiZWwnOiAnR2l0IGFkZCBmaWxlJ1xuICAgICAgICAnY29tbWFuZCc6ICdnaXQtcGx1czphZGQnXG4gICAgICB9XG4gICAgXVxuICB9XG4iXX0=
